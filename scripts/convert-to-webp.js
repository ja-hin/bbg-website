import fs from "fs";
import path from "path";
import sharp from "sharp";
import { glob } from "glob";

// Configuration
const ASSETS_DIR = path.resolve("attached_assets");
const CLIENT_SRC_DIR = path.resolve("client", "src");
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

async function convertImageToWebp(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const webpPath = path.join(dir, `${name}.webp`);

  try {
    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);

    console.log(
      `Converted: ${path.basename(filePath)} -> ${path.basename(webpPath)}`,
    );
    return {
      originalPath: filePath,
      webpPath: webpPath,
      originalName: path.basename(filePath),
      webpName: path.basename(webpPath),
    };
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error);
    return null;
  }
}

async function updateSourceCodeReferences(conversions) {
  console.log("Scanning source code for references...");

  // Find all readable files in client/src
  const sourceFiles = await glob("**/*.{ts,tsx,js,jsx,css,scss}", {
    cwd: CLIENT_SRC_DIR,
    absolute: true,
  });

  for (const file of sourceFiles) {
    let content = fs.readFileSync(file, "utf-8");
    let modifications = 0;

    for (const conversion of conversions) {
      // Escape special regex characters in filenames
      const escapedOriginalName = conversion.originalName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      // Look for the filename in imports or src attributes
      // We look for the exact filename to avoid partial matches
      const regex = new RegExp(escapedOriginalName, "g");

      if (regex.test(content)) {
        content = content.replace(regex, conversion.webpName);
        modifications++;
      }
    }

    if (modifications > 0) {
      fs.writeFileSync(file, content, "utf-8");
      console.log(
        `Updated ${modifications} references in ${path.relative(process.cwd(), file)}`,
      );
    }
  }
}

async function main() {
  console.log("Starting WebP conversion...");

  // 1. Find all images
  const files = fs.readdirSync(ASSETS_DIR);
  const imageFiles = files.filter((file) =>
    IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()),
  );

  console.log(`Found ${imageFiles.length} images to process.`);

  const conversions = [];

  // 2. Convert images
  for (const file of imageFiles) {
    const filePath = path.join(ASSETS_DIR, file);
    const result = await convertImageToWebp(filePath);
    if (result) {
      conversions.push(result);
    }
  }

  // 3. Update source code
  if (conversions.length > 0) {
    await updateSourceCodeReferences(conversions);
  }

  // 4. Cleanup (Safety check: only delete if conversion was successful and recorded)
  console.log("Cleaning up original files...");
  for (const conversion of conversions) {
    if (fs.existsSync(conversion.webpPath)) {
      try {
        fs.unlinkSync(conversion.originalPath);
        console.log(`Deleted original: ${conversion.originalName}`);
      } catch (e) {
        console.error(`Failed to delete ${conversion.originalName}:`, e);
      }
    }
  }

  console.log("WebP conversion complete!");
}

main().catch(console.error);

const fs = require("fs");
const path = require("path");

const files = [
  path.join(__dirname, "client/src/pages/home.tsx"),
  path.join(__dirname, "client/src/pages/plans.tsx"),
];

files.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Padding
  content = content.replace(/p-6 sm:p-7/g, "p-4 sm:p-5");
  content = content.replace(/p-6 sm:p-8/g, "p-4 sm:p-5");

  // Header height
  content = content.replace(
    /min-h-\[120px\] sm:min-h-\[150px\]/g,
    "min-h-[90px] sm:min-h-[120px]",
  );

  // Pricing font
  content = content.replace(/text-5xl sm:text-6xl/g, "text-3xl sm:text-4xl");

  // Title font
  content = content.replace(/text-3xl sm:text-4xl/g, "text-2xl sm:text-3xl");

  // Loader
  content = content.replace(
    /Loader2 className="h-8 w-8/g,
    'Loader2 className="h-6 w-6',
  );

  // Spacing
  content = content.replace(/space-y-3/g, "space-y-2");
  content = content.replace(/space-y-4/g, "space-y-3");
  content = content.replace(/space-y-6/g, "space-y-3");

  // Gaps
  content = content.replace(/gap-4/g, "gap-3");

  // Icons
  content = content.replace(/w-6 h-6 sm:w-7 sm:h-7/g, "w-5 h-5 sm:w-6 sm:h-6");
  content = content.replace(/w-6 h-6 sm:w-8 sm:h-8/g, "w-5 h-5 sm:w-6 sm:h-6");
  content = content.replace(/mt-1/g, "mt-0.5");

  // Bottom area
  content = content.replace(
    /px-6 sm:px-8 pb-2 sm:pb-3/g,
    "px-4 sm:px-5 pb-1 sm:pb-2",
  );
  content = content.replace(
    /pt-4 sm:pt-6 pb-2 sm:pb-3/g,
    "pt-2 sm:pt-3 pb-1 sm:pb-2",
  );

  // Card container
  content = content.replace(/min-h-96/g, "min-h-[350px]");

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated ${filePath}`);
});

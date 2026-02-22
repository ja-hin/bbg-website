const fs = require("fs");

const paths = ["client/src/pages/home.tsx", "client/src/pages/plans.tsx"];

function condense(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Header Padding
  content = content.replace(/className="p-6 sm:p-7/g, 'className="p-4 sm:p-5');

  // 2. Content Padding
  content = content.replace(
    /className="flex-grow p-6 sm:p-8/g,
    'className="flex-grow p-4 sm:p-5',
  );
  content = content.replace(/className="p-6 sm:p-8/g, 'className="p-4 sm:p-5'); // For Extend+ and flip-back

  // 3. Header Title Min-H
  content = content.replace(
    /min-h-\[120px\] sm:min-h-\[150px\]/g,
    "min-h-[90px] sm:min-h-[120px]",
  );

  // 4. Pricing Font Size
  content = content.replace(/text-5xl sm:text-6xl/g, "text-3xl sm:text-4xl");

  // 5. Card Main Titles (BuyBack, Guarantee, Extend+)
  content = content.replace(/text-3xl sm:text-4xl/g, "text-2xl sm:text-3xl");

  // 6. Loader Size
  content = content.replace(
    /Loader2 className="h-8 w-8/g,
    'Loader2 className="h-6 w-6',
  );
  content = content.replace(
    /Loader2 className="h-4 w-4/g,
    'Loader2 className="h-3 w-3',
  );

  // 7. Spacing inside cards
  content = content.replace(/space-y-3/g, "space-y-2");
  content = content.replace(/space-y-4/g, "space-y-2");
  content = content.replace(/space-y-6/g, "space-y-3");

  // 8. Gap between icon and text
  content = content.replace(/flex gap-4/g, "flex gap-3");
  content = content.replace(/items-start gap-4/g, "items-start gap-3");

  // 9. Icon sizes & margins
  content = content.replace(/w-6 h-6 sm:w-8 sm:h-8/g, "w-5 h-5 sm:w-6 sm:h-6"); // Shield Check etc
  content = content.replace(/w-6 h-6 sm:w-7 sm:h-7/g, "w-5 h-5 sm:w-6 sm:h-6"); // Regular icons
  content = content.replace(/flex-shrink-0 mt-1/g, "flex-shrink-0 mt-0.5");

  // 10. Bottom Buttons area
  content = content.replace(
    /px-6 sm:px-8 pb-2 sm:pb-3/g,
    "px-4 sm:px-5 pb-1 sm:pb-2",
  );
  content = content.replace(
    /p-6 sm:p-8 pt-4 sm:pt-6 pb-2 sm:pb-3/g,
    "p-4 sm:p-5 pt-2 sm:pt-3 pb-1 sm:pb-2",
  );

  // 11. Validity border
  content = content.replace(/border-t pt-4/g, "border-t pt-2");

  // 12. Card Container Min-height
  content = content.replace(/min-h-96/g, "min-h-[350px]");

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Condensed ${filePath}`);
}

paths.forEach((p) => {
  if (fs.existsSync(p)) {
    condense(p);
  } else {
    console.log(`File not found: ${p}`);
  }
});

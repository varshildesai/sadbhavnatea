const PptxGenJS = require("pptxgenjs");

let pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";
pptx.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };

// Colors matching the Vercel live website
const primaryColor = "E67300"; // Orange
const secondaryColor = "007A33"; // Green
const bgColor = "FDFBF7"; // Surface off-white
const white = "FFFFFF";
const textDark = "333333";

pptx.defineSlideMaster({
  title: "MASTER_SLIDE",
  background: { color: bgColor },
  objects: [
    // Header mimicking the website's green Navbar
    { rect: { x: 0, y: 0, w: "100%", h: 0.6, fill: { color: secondaryColor } } },
    { text: { text: "Sadbhavna Tea", options: { x: 0.3, y: 0.1, w: 5, h: 0.4, color: white, fontSize: 18, bold: true } } },
    
    // Footer mimicking the website's orange bottom bar
    { rect: { x: 0, y: 5.2, w: "100%", h: 0.4, fill: { color: primaryColor } } },
    {
      text: {
        text: "Sadbhavna Tea - E-Commerce Platform | varshildesai247@gmail.com",
        options: { x: 0.3, y: 5.2, w: 8, h: 0.4, color: white, fontSize: 12 },
      },
    },
  ],
});

function addSlideTitle(slide, title) {
  slide.addText(title, {
    x: 0.5, y: 0.8, w: 9, h: 0.6, fontSize: 32, bold: true, color: secondaryColor,
  });
}

// ============================================
// Slide 1: Title Slide
// ============================================
let slide1 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide1.addText("Sadbhavna Tea", {
  x: 0, y: 1.5, w: "100%", h: 1, align: "center", fontSize: 54, bold: true, color: primaryColor,
});
slide1.addText("Online Tea Store - Project Presentation", {
  x: 0, y: 2.3, w: "100%", h: 0.5, align: "center", fontSize: 24, bold: true, color: secondaryColor,
});

slide1.addText([
  { text: "GROUP ID: ", options: { bold: true, color: secondaryColor } }, { text: "[Group ID]\n\n" },
  { text: "Students:\n", options: { bold: true, color: primaryColor } },
  { text: "• Varshil Desai (3110)\n" },
  { text: "• Krish Vaghani (3272)\n" },
  { text: "• Om Kanpariya (3029)" },
], { x: 1.5, y: 3.2, w: 4, h: 1.5, fontSize: 16, color: textDark });

slide1.addText([
  { text: "Program & Semester: ", options: { bold: true, color: secondaryColor } }, { text: "[Program] - Sem [X]\n" },
  { text: "College: ", options: { bold: true, color: secondaryColor } }, { text: "K. S. School of Business Management & IT\n" },
  { text: "University: ", options: { bold: true, color: secondaryColor } }, { text: "Gujarat University\n" },
  { text: "Internship Org: ", options: { bold: true, color: secondaryColor } }, { text: "[Organization Name]\n" },
  { text: "Guide / Mentor: ", options: { bold: true, color: secondaryColor } }, { text: "[Mentor Name]" },
], { x: 5.5, y: 3.2, w: 4.5, h: 1.5, fontSize: 16, color: textDark });

// ============================================
// Slide 2: What is our project?
// ============================================
let slide2 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
addSlideTitle(slide2, "1. What is Sadbhavna Tea?");
slide2.addText([
  { text: "About The Project\n", options: { bold: true, color: primaryColor } },
  { text: "We built a modern, fast, and easy-to-use website for selling premium tea online. Users can visit our site, look at different teas, and easily buy them.\n\n" },
  { text: "Who is it for?\n", options: { bold: true, color: primaryColor } },
  { text: "It's for people who love tea and want to buy high-quality tea easily from their phones or computers." }
], { x: 0.5, y: 1.8, w: 8.5, h: 3, fontSize: 22, color: textDark });

// ============================================
// Slide 3: Live Website - Home Page
// ============================================
let slide3 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
addSlideTitle(slide3, "2. Live Website - Home Page");
slide3.addImage({ path: "screenshot_home.png", x: 0.5, y: 1.6, w: 5, h: 3.3, sizing: { type: "contain", w: 5, h: 3.3 } });
slide3.addText([
  { text: "Welcome Screen\n", options: { bold: true, color: primaryColor } },
  { text: "This is what users see when they visit our live website (sadbhavnatea.vercel.app).\n\n" },
  { text: "It uses our Green and Orange theme to give a very fresh and premium 'tea' feeling." }
], { x: 6, y: 1.8, w: 3.5, h: 2, fontSize: 18, color: textDark });

// ============================================
// Slide 4: Shopping - Products Page
// ============================================
let slide4 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
addSlideTitle(slide4, "3. Browsing Our Teas");
slide4.addImage({ path: "screenshot_products.png", x: 0.5, y: 1.6, w: 5, h: 3.3, sizing: { type: "contain", w: 5, h: 3.3 } });
slide4.addText([
  { text: "Our Products\n", options: { bold: true, color: primaryColor } },
  { text: "Customers can see all our different teas here. They can view prices, read reviews, and click 'Add to Cart' to buy." }
], { x: 6, y: 1.8, w: 3.5, h: 2, fontSize: 18, color: textDark });

// ============================================
// Slide 5: Shopping Cart
// ============================================
let slide5 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
addSlideTitle(slide5, "4. The Shopping Cart");
slide5.addImage({ path: "screenshot_cart.png", x: 0.5, y: 1.6, w: 5, h: 3.3, sizing: { type: "contain", w: 5, h: 3.3 } });
slide5.addText([
  { text: "Easy Checkout\n", options: { bold: true, color: primaryColor } },
  { text: "This is where customers review their order. They can increase quantity or remove items before paying securely online." }
], { x: 6, y: 1.8, w: 3.5, h: 2, fontSize: 18, color: textDark });

// ============================================
// Slide 6: Admin Panel
// ============================================
let slide6 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
addSlideTitle(slide6, "5. The Admin Panel");
slide6.addImage({ path: "screenshot_admin.png", x: 0.5, y: 1.6, w: 5, h: 3.3, sizing: { type: "contain", w: 5, h: 3.3 } });
slide6.addText([
  { text: "Owner Dashboard\n", options: { bold: true, color: primaryColor } },
  { text: "This is the secure backend panel for the website owner (varshildesai247@gmail.com).\n\n" },
  { text: "Here, we can see total sales, manage orders, and add new tea products to the store easily." }
], { x: 6, y: 1.8, w: 3.5, h: 2.5, fontSize: 18, color: textDark });

// ============================================
// Slide 7: How we built it (Tech Stack)
// ============================================
let slide7 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
addSlideTitle(slide7, "6. How We Built It");

slide7.addText([
  { text: "Frontend (What the user sees)\n", options: { bold: true, color: primaryColor } },
  { text: "We used React.js and Tailwind CSS. This makes the website look beautiful on both phones and computers.\n\n" },
  { text: "Backend (The brain of the website)\n", options: { bold: true, color: primaryColor } },
  { text: "We used Node.js. It handles the user login, payments, and shopping cart logic safely.\n\n" },
  { text: "Database (Where data is saved)\n", options: { bold: true, color: primaryColor } },
  { text: "We used MongoDB to store all user accounts, orders, and product details." }
], { x: 0.5, y: 1.5, w: 8.5, h: 3.5, fontSize: 18, color: textDark });

// ============================================
// Slide 8: Thank You
// ============================================
let slide8 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
slide8.addText("Thank You!", {
  x: 0, y: 2, w: "100%", h: 1, align: "center", fontSize: 64, bold: true, color: primaryColor,
});
slide8.addText("We hope you enjoyed learning about Sadbhavna Tea.", {
  x: 0, y: 3.5, w: "100%", h: 0.5, align: "center", fontSize: 24, bold: true, color: secondaryColor,
});

pptx.writeFile({ fileName: "Sadbhavna_Tea_Live_Presentation.pptx" }).then(() => {
  console.log("PPTX created successfully!");
});

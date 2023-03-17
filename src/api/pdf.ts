import { PDFRender } from "../render/pdf";


const pdf = new PDFRender();
pdf.render("test/test.$.html", { hello: "world" }, "test/test.pdf");
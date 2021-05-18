import sharp from "sharp";
import fs from "fs";
import PDFDocument from "pdfkit";

/**
 * @param {string} image_file
 */

export const convert_to_png = (image_file) => {
	sharp(image_file, { failOnError: false })
		.png()
		.flatten({ background: { r: 255, g: 255, b: 255 } })
		.toFile(image_file.replace(".svg", ".png"));
};

/**
 * @param {string[]} svg_files
 */

export const remove_svg_files = (svg_files) => {
	svg_files.forEach((file) => fs.unlinkSync(file));
};

/**
 * @param {string[]} png_files
 * @param {string} output_dir
 * @param {string} score_title
 */

export const pngs_to_pdf = (png_files, output_dir, score_title) => {
	if (!fs.existsSync(output_dir)) {
		fs.mkdirSync(output_dir);
	}

	const score = new PDFDocument();
	score.pipe(fs.createWriteStream(`${output_dir}/${score_title}.pdf`));

	png_files.forEach((file) => {
		score.image(file, 0, 0);
		if (png_files.indexOf(file) != png_files.length - 1) score.addPage();
	});
	score.end();
};

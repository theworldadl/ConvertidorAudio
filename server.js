const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Configurar Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Ruta para manejar la conversión de audio
app.post('/convert', upload.single('audio'), (req, res) => {
    const inputFilePath = req.file.path;
    const outputFormat = req.body.format;
    const outputFilePath = path.join(__dirname, 'output', `converted.${outputFormat}`);

    // Realizar la conversión con ffmpeg
    ffmpeg(inputFilePath)
        .toFormat(outputFormat)
        .on('end', () => {
            // Leer el archivo convertido y enviarlo como respuesta
            res.download(outputFilePath, `converted.${outputFormat}`, (err) => {
                if (err) {
                    res.status(500).send('Error en la conversión.');
                }
                // Eliminar archivos temporales
                fs.unlink(inputFilePath, () => {});
                fs.unlink(outputFilePath, () => {});
            });
        })
        .on('error', (err) => {
            res.status(500).send('Error en la conversión: ' + err.message);
            fs.unlink(inputFilePath, () => {});
        })
        .save(outputFilePath);
});

// Crear carpetas necesarias
if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
}

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

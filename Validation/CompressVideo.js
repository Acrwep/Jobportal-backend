const ffmpegPath = require("ffmpeg-static");
// const ffmpegPath = "/usr/bin/ffmpeg"; // production
const { spawn } = require("child_process");
const path = require("path");

function compressVideo(inputPath, outputPath, crf = 28) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      "-i",
      inputPath,
      "-vcodec",
      "libx265",
      "-preset",
      "ultrafast",
      "-crf",
      `${crf}`,
      "-acodec",
      "copy",
      "-movflags",
      "+faststart", // <== THIS is the key!
      outputPath,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`ffmpeg compressing status: ${data}`);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

module.exports = compressVideo;

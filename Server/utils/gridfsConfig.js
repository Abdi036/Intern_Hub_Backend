const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { GridFSBucket } = require("mongodb");

// Create GridFS stream
let gfs;
let gridFSBucket;

const conn = mongoose.connection;
conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, {
    bucketName: "coverLetters",
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("coverLetters");
});

// Function to upload file to GridFS
const uploadToGridFS = async (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = gridFSBucket.openUploadStream(filename, {
      contentType: "application/pdf",
    });

    uploadStream.on("error", (error) => {
      reject(error);
    });

    uploadStream.on("finish", () => {
      resolve(uploadStream.id);
    });

    uploadStream.end(fileBuffer);
  });
};

// Function to get file from GridFS
const getFileFromGridFS = async (fileId) => {
  return new Promise((resolve, reject) => {
    const downloadStream = gridFSBucket.openDownloadStream(fileId);
    const chunks = [];

    downloadStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on("error", (error) => {
      reject(error);
    });

    downloadStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
};

// Function to delete file from GridFS
const deleteFileFromGridFS = async (fileId) => {
  return new Promise((resolve, reject) => {
    gridFSBucket.delete(fileId, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  uploadToGridFS,
  getFileFromGridFS,
  deleteFileFromGridFS,
  gfs,
};

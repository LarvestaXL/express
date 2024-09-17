import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, 'upload/');//folder untuk simpan gambar
    },
    filename: (req, file, cb)=> {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage: storage });

export default upload;
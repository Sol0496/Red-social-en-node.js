const { Router } = require('express');

const path = require('path');
const  fs  = require('fs-extra');
const router = Router();
const mongoose = require('mongoose');
const md5 = require('md5');


// Models

const { randomNumber } = require('../helpers/libs');
const Image = require('../models/Image');
const Comment = require('../models/Comment');
const User = require('../models/User');
const sidebar = require('../helpers/sidebar');

router.get('/images', async (req, res) => {

    const images = await Image.find().sort({ timestamp: -1 });

     let viewModel = { images: [] };
     viewModel.images = images;
     viewModel = await sidebar(viewModel);

     console.log(viewModel);

     

        res.render('images/images',viewModel);


});



router.post('/images/image', async (req, res) => {

    const saveImage = async () => {
    const imgUrl = randomNumber();
    const images = await Image.find({ filename: imgUrl });
    if (images.length > 0) {
      saveImage()
    } else {
      // Image Location
      const imageTempPath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();
      const targetPath = path.resolve(`src/public/img/uploads/${imgUrl}${ext}`);

      // Validate Extension
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
        // you wil need the public/temp path or this will throw an error
        await fs.rename(imageTempPath, targetPath);
        const newImg = new Image({
          title: req.body.title,
          filename: imgUrl + ext,
          description: req.body.description,

        });
        const imageSaved = await newImg.save();
        res.redirect('/images/image/'+ imgUrl );
        

      } else {
        await fs.unlink(imageTempPath);
        res.status(500).json({ error: 'Only Images are allowed' });
      }
    }
  };

  saveImage();


   
}); 

router.get('/images/image/:image_id', async (req, res) => {

  const viewModel = { image: {}, comments: [] };
  const image = await Image.findOne({filename: { $regex: req.params.image_id }});
  if (image) {
    image.views = image.views + 1;
    viewModel.image = image;
    image.save();
    const comments = await Comment.find({image_id: image._id})
      .sort({'timestamp': 1});
    viewModel.comments = comments;
    
    res.render('images/image',viewModel);

  } else {
    res.redirect('/');
  }



});

router.post('/images/image/:image_id/comment', async (req, res) => {

const image = await Image.findOne({filename: {$regex: req.params.image_id}});

const { comment } = req.body;


  if (image) {
    const newComment = new Comment({comment});
    
    newComment.gravatar = md5(req.user.email);
    newComment.name=req.user.name;
    newComment.image_id = image._id;
    await newComment.save();
    res.redirect('/images/image/' + image.uniqueId );
  } else {
    res.redirect('/');
  }


});

router.post('/images/image/:image_id/like', async (req, res) => {
  
  const image = await Image.findOne({filename: {$regex: req.params.image_id}});
  console.log(image)
  if (image) {
    image.likes = image.likes + 1;
    await image.save();
    res.json({likes: image.likes})
  } else {
    res.status(500).json({error: 'Internal Error'});
  }

}); 

router.delete('/images/image/:image_id', async (req, res) => {
  
  const image = await Image.findOne({filename: {$regex: req.params.image_id}});
  if (image) {
    await fs.unlink(path.resolve('./src/public/img/uploads/' + image.filename));
    await Comment.deleteOne({image_id: image._id});
    await image.remove();
    res.json(true);
  } else {
    res.json({response: 'Bad Request.'})
  }
});



module.exports = router;


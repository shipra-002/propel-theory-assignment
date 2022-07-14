const cardModel= require("../models/cardModel")
const {isValidRequestBody,isValid,isValidObjectId} = require('../validation/validator');
const aws= require('aws-sdk')
const moment=require('moment')

// for aws s3 link
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)


let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: "2006-03-01" })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "group23/" + file.originalname,
            Body: file.buffer
        }
        console.log(uploadFile)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }

            return resolve(data.Location)
        }
        )

    }
    )
}
//
const createCard= async function(req,res){
    try{
        const requestBody = req.body;
      if (!isValidRequestBody(requestBody)) {
         return res.status(400).send({ status: false, message: 'Invalid Request parameters. Please provide User details' })
        } 

    const {cardId,companyName,websiteURL,socialURLs,isCardDeleted,companyLogo}= requestBody
     if(!isValidObjectId(cardId)){
        return res.status(400).send({status:false,message:"Invalid card id"})
     }
    if (!isValid(companyName)) {
        return res.status(400).send({ status: false, message: 'companyName is required' })
    }

    if (!isValid(websiteURL)) {
        return res.status(400).send({ status: false, message: 'websiteURL is required' })
    }
    if(!isValid(socialURLs)){
        return res.status(400).send({status:false,message:"socail url is required"})
    }
    const validSocial = function (x) {
        if (x == "facebook" || x == "twitter" || x == "instagram") {
          return true;
        }
        return false;
      };
    if(!validSocial(socialURLs)){
        return res.status(400).send({status:false,messge:"Is not valid url"})
    }
    let files = req.files
    if (files && files.length > 0) {
        let uploadedFileURL = await uploadFile(files[0])
        requestBody.companyLogo = uploadedFileURL
    }else{
       return res.status(400).send({ status: false, message: "plz enter a company logo" })
    }
    const card = await cardModel.create(requestBody)
    return res.status(201).send({status: true, message: 'card created successfully', data: card})
    }catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}
//
const getCard= async function(req,res){
    try{
        const requestBody=req.body;
        const newCard= await cardModel.find(requestBody).find({isCardDeleted:false}).populate("cardId").count()
        if (newCard.length == 0) {
            return res.status(404).send({ status: false, msg: "No cards Available." })
        }
      return  res.status(200).send({ status: true, data:newCard, count:newCard });

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}
//
const updateCard= async function(req,res){
    try{
        let cardId=req.params.cardId

        if (!isValid(cardId)) {
          return  res.status(400).send({ status: false, message: "Please , provide card id in path params" })
          }

        if(!isValidObjectId(cardId)){
            return res.status(500).send({status:false,message:"please provide valid card id"})
        }
        let card=await cardModel.findOne({_id:cardId,isCardDeleted:true})
        if(!card){
            return res.status(400).send({status:false,message:"card not exists"})
        }
        let updateBody = req.body

        let { comapnyName, websiteURL,socaialURLs,companyLogo } = updateBody

        let files = req.files
        if (files) {
            if (Object.keys(files).length != 0) {
                const updatecompanyLogo = await uploadFile(files[0]);
                updateBody.companyLogo = updatecompanyLogo;
            }
        }

        if (!isValidRequestBody(updateBody)) {
            return res.status(400).send({
                status: false,
                message: 'Please, provide some data to update'
            })
        }
        if(!isValid(updateBody.companyName)){
            return res.status(400).send({status:false,message:"company name is required"})
        }
        let updatedCard= await cardModel.findOneAndUpdate({_id:cardId,isCardDeleted:false},{$set:{companyName:companyName,websiteURL:websiteURL,socialURLs:socialURLs,companyLogo:updateBody.companyLogo}},{new:true})

       return res.status(200).send({status:true, message:"update card",data:updatedCard})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}
//
const deleteCard= async function(req,res){
    try{
        let cardId= req.params.cardId
        
        if (!isValid(cardId)) {
            return  res.status(400).send({ status: false, message: "Please , provide card id in path params" })
            }
  
          if(!isValidObjectId(cardId)){
              return res.status(500).send({status:false,message:"please provide valid card id"})
          }
        
        const card = await cardModel.findById({_id:cardId})
        if (!card) {
            return res.status(404).send({ status: false, message: "card not found" })
        }
        if (card.isCardDeleted == true) {
            return res.status(400).send({ status: false, message: "card is already deleted" })
        }
        const delCard = await cardModel.findByIdAndUpdate(cardId, {$set: { isCardDeleted: true, deletedAt: moment().format("YYYY-MM-DD")}}, { new: true })
        return res.status(200).send({ status: true, message: "card deleted", data: delCard })

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}
module.exports.createCard=createCard;
module.exports.getCard=getCard;
module.exports.updateCard=updateCard;
module.exports.deleteCard=deleteCard;

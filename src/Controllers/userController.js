const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const {isValidRequestBody,isValid} = require('../validation/validator');


const createUser = async (req, res) => {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid Request parameters. Please provide User details' })
        }
        
        const { firstName, lastName, contactNumber, email, password } = requestBody;

        if (!isValid(firstName.trim())) {
            return res.status(400).send({ status: false, message: 'firstName is required' })
        }

        if (!isValid(lastName.trim())) {
            return res.status(400).send({ status: false, message: 'lastName is required' })
        }

        if (!isValid(contactNumber)) {
            return res.status(400).send({ status: false, message: 'contact num. is required' })
        }
        const alreadyExsit = await userModel.findOne({contactNumber })
        if (alreadyExsit) {
            return res.status(400).send({ status: false, msg: "phone already exits" })
        }
        
        if (!(/^([+]\d{2})?\d{10}$/.test(contactNumber))){
        return res.status(400).send({ status: false, msg: "Please Enter  a Valid Phone Number" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'email is required' })
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'Email should be valid email' })
        }
        let alreadyExistEmail = await userModel.findOne({ email })
        if (alreadyExistEmail) {
            return res.status(400).send({ status: false, msg: "email already exit" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' })

        }
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(requestBody.password))) {
            return res.status(400).send({ status: false, msg: "please provide valid password" })
        }

        const userCreated = await userModel.create(requestBody)
        res.status(201).send({ status: true, message: "Success", data: userCreated })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


const loginUser = async function (req, res) {
    try {
        let userName = req.body.email;
        let password = req.body.password;
        if (!userName || !password) {
            return res.status(400).send({ status: false, msg: "email and password must be present" })
        }

        let user = await userModel.findOne({ email: userName, password: password });
        if (!user)
            return res.status(400).send({
                status: false,
                msg: "user name or the password is not correct",
            });

        let token = jwt.sign(
            { userID: user._id.toString() }, 'propel theory', { expiresIn: "300000 m" }
        );
        res.setHeader("x-api-key", token);
        return res.status(201).send({ status: true, msg: "success", data: token });
    }
    catch (err) {

        return res.status(500).send({ msg: "Error", error: err.message })
    }
}



module.exports.createUser=createUser;
module.exports.loginUser=loginUser;
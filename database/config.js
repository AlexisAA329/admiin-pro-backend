const mongoose = require('mongoose');

const dbConnection = async () => {

    try{
        mongoose.connect(process.env.DB_CMM, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true
        });
        
        console.log('BD Online');

    } 
    catch (error){
        console.log(error);
        throw new Error('Error a la hora de iniciar la BD ver logs')
    }
}


module.exports = {
    dbConnection
}
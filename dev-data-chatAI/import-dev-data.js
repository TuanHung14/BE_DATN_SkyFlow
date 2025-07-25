require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Prompt = require('../model/promptModel');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
}).then(() =>  console.log('Connected to MongoDB'));

//READ JSON file
const prompts = JSON.parse(fs.readFileSync(`${__dirname}/prompts.json`, 'utf-8'));

//Import into DB

const importData = async () => {
    try {
        await Prompt.create(prompts);
        console.log('Data Imported...');
    } catch (error) {
        console.error('Error importing data', error);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Prompt.deleteMany();
        console.log('Data deleted...');
    } catch (error) {
        console.error('Error deleting data', error);
    }
    process.exit();
};

if(process.argv[2] === '--import') {
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}
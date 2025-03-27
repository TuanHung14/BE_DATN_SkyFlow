const cron = require('node-cron');

module.exports = () => {
    cron.schedule('* * * * *', () => {
        console.log('running a task every minute');
    });
    console.log('Running cron cron_jobs');
}


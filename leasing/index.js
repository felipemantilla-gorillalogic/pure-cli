import inquirer from 'inquirer';
import logger from '../helpers/logger.js';

const LeasingOptions = {
    NEW_LEASE_APP: {
        name: 'New Lease Application',
        script: './create-application/index.js'
    },
    TRANSUNION: {
        name: 'Transunion',
        script: './transunion/index.js'
    }
}

const LEASING_OPTIONS = [
    {
        type: 'list',
        name: 'script',
        message: 'Choose an option:',
        choices: [...Object.values(LeasingOptions).map((option) => option.name)]
    }
];

export const main = async () => {
    const answers = await inquirer.prompt(LEASING_OPTIONS);
    try {
        const option = Object.values(LeasingOptions).find(option => option.name === answers.script)
        const module = await import(option.script);
        module.main();
    } catch (error) {
        console.log(error)
        logger.error('Invalid option selected')
        logger.warn('Selected script must be a valid path to a script file. and the file must have exported a main function.')
    }
}
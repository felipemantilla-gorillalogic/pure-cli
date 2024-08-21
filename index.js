import inquirer from 'inquirer';
import logger, { printLogo } from './helpers/logger.js';

const Options = {
    LEASING: {
        name: 'Leasing',
        script: './leasing/index.js'
    },
    CORE: {
        name: 'Core',
        script: './core/index.js'   
    }
}

const PURE_MODULES = [
    {
        type: 'list',
        name: 'module',
        message: 'Choose a module:',
        choices: [...Object.values(Options).map((option) => option.name)]
    }
];



const main = async () => {
    
    printLogo();
    
    const answers = await inquirer.prompt(PURE_MODULES);

    try {
        const option = Object.values(Options).find(option => option.name === answers.module)
        const module = await import(option.script);
        module.main();
    } catch (error) {
        console.log(error)
        logger.error('Invalid option selected');
        logger.warn('Selected script must be a valid path to a script file. and the file must have exported a main function.');
    }
}

main()
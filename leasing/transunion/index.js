import inquirer from "inquirer";
import logger from "../../helpers/logger.js";
import { APPLICATION_PAGE_PAYLOAD, RESIDENCE_PAGE_PAYLOAD } from "../create-application/default-payload.js";
import { ACCEPT, CRIMINAL_PHASED, EVICTION_PHASED, DECLINE, REFER } from "./payloads.js";

const TransunionOptions = {
    ACCEPT: {
        name: 'Lease Application with ACCEPT Screening',
        payload: ACCEPT
    },
    CRIMINAL_PHASED: {
        name: 'Lease Application with CRIMINAL Phased Screening',
        payload: CRIMINAL_PHASED
    },
    EVICTION_PHASED: {
        name: "Lease Application with EVICTION Phased Screening",
        payload: EVICTION_PHASED
    },
    DECLINE: {
        name: "Lease Application with DECLINE Screening",
        payload: DECLINE
    },
    REFER: {
        name: "Lease Application with REFER Screening",
        payload: REFER
    }

}

const TRANSUNION_OPTIONS = [
    {
        type: 'list',
        name: 'script',
        message: 'Choose an option:',
        choices: [...Object.values(TransunionOptions).map((option) => option.name)]
    }
];

const updatePayload = (selectedOptionPayload) => {

    const selectedOption = selectedOptionPayload;

    // Update APPLICATION_PAGE_PAYLOAD
    APPLICATION_PAGE_PAYLOAD.first_name = selectedOption.first_name;
    APPLICATION_PAGE_PAYLOAD.middle_name = selectedOption.middle_name;
    APPLICATION_PAGE_PAYLOAD.last_name = selectedOption.last_name;
    APPLICATION_PAGE_PAYLOAD.social_security_number = selectedOption.social_security_number;
    APPLICATION_PAGE_PAYLOAD.date_of_birth = selectedOption.date_of_birth;

    // Update RESIDENCE_PAGE_PAYLOAD
    RESIDENCE_PAGE_PAYLOAD.address_line_1 = selectedOption.address_line_1;
    RESIDENCE_PAGE_PAYLOAD.address_line_2 = selectedOption.address_line_2;
    RESIDENCE_PAGE_PAYLOAD.city = selectedOption.city;
    RESIDENCE_PAGE_PAYLOAD.state_abv = selectedOption.state_abv;
    RESIDENCE_PAGE_PAYLOAD.postal_code = selectedOption.postal_code;

    return {
        APPLICATION_PAGE_PAYLOAD,
        RESIDENCE_PAGE_PAYLOAD
    }
}

export const main = async () => {

    logger.warn(`
    ╔═══════════════════════════════════════════════════════════════════════╗
    ║ TransUnion Eviction and Criminal Phased screening must be requested   ║
    ║ using specific property IDs.                                          ║
    ║                                                                       ║
    ║ You must update TRANSUNION_SANDBOX_PROPERTY_ID on Doppler:            ║
    ║ - Eviction: 1b92ea99                                                  ║
    ║ - Criminal: 1b92ea9a                                                  ║
    ║ - Any other: 1b92ea97                                                 ║
    ║                                                                       ║
    ║ The results from TU depend on the match of all these variables;       ║
    ║ otherwise, the results are unpredictable.                             ║
    ╚═══════════════════════════════════════════════════════════════════════╝
    `)

    const answers = await inquirer.prompt(TRANSUNION_OPTIONS);
    try {
        const option = Object.values(TransunionOptions).find(option => option.name === answers.script)
        const predefinedDefaultPayloads = updatePayload(option.payload)

        // call create-application script with default values
        const module = await import('../create-application/index.js');
        module.main({ predefinedDefaultPayloads });
    } catch (error) {
        console.log(error)
        logger.error('Invalid option selected')
        logger.warn('Selected script must be a valid path to a script file. and the file must have exported a main function.')
    }

}
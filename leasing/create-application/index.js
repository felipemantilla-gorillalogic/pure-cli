import inquirer from 'inquirer';
import axios from 'axios';
import logger, { printLogo } from '../../helpers/logger.js';
import { APPLICATION_PAGE_PAYLOAD, RESIDENCE_PAGE_PAYLOAD, EMPLOYMENT_PAGE_PAYLOAD, BACKGROUND_CHECK_PAGE_PAYLOAD, ADD_ONS_PAGE_PAYLOAD } from './default-payload.js';
import { v4 as uuidv4 } from 'uuid';

const getEnvironment = () => {
    return {
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-pure-corporation-id": "0885a5e0-d662-41c2-a52e-46754f2d602b",
            "Referer": "https://apply.purepm.dev/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        leasingUrl: 'https://leasing.purepm.dev/api',
    }
}

const getDefaultPayload = async (predefinedDefaultPayloads) => {

    const _APPLICATION_PAGE_PAYLOAD = predefinedDefaultPayloads.APPLICATION_PAGE_PAYLOAD || APPLICATION_PAGE_PAYLOAD;
    const _RESIDENCE_PAGE_PAYLOAD = predefinedDefaultPayloads.RESIDENCE_PAGE_PAYLOAD || RESIDENCE_PAGE_PAYLOAD;
    const _EMPLOYMENT_PAGE_PAYLOAD = predefinedDefaultPayloads.EMPLOYMENT_PAGE_PAYLOAD || EMPLOYMENT_PAGE_PAYLOAD;
    const _BACKGROUND_CHECK_PAGE_PAYLOAD = predefinedDefaultPayloads.BACKGROUND_CHECK_PAGE_PAYLOAD || BACKGROUND_CHECK_PAGE_PAYLOAD;
    const _ADD_ONS_PAGE_PAYLOAD = predefinedDefaultPayloads.ADD_ONS_PAGE_PAYLOAD || ADD_ONS_PAGE_PAYLOAD;

    return {
        APPLICATION_PAGE_PAYLOAD: _APPLICATION_PAGE_PAYLOAD,
        RESIDENCE_PAGE_PAYLOAD: _RESIDENCE_PAGE_PAYLOAD,
        EMPLOYMENT_PAGE_PAYLOAD: _EMPLOYMENT_PAGE_PAYLOAD,
        BACKGROUND_CHECK_PAGE_PAYLOAD: _BACKGROUND_CHECK_PAGE_PAYLOAD,
        ADD_ONS_PAGE_PAYLOAD: _ADD_ONS_PAGE_PAYLOAD
    }
}

/**
 * 
 * @param {predefinedDefaultPayloads} predefinedDefaultPayloads is used to pass payloads according to TU requests 
 * @returns 
 */
export const main = async ({ predefinedDefaultPayloads = {}} = {}) => {

    logger.warn(`
    ╔════════════════════════════════════════════════════════════════════════════════════════════╗
    ║ ⚠️ Lease Application process started                                                        ║
    ║ ⚠️ Default values are stored in default-payload.js, you can change them there before        ║
    ║    running the script                                                                      ║
    ╚════════════════════════════════════════════════════════════════════════════════════════════╝
    `)

    const defaultPayloads = await getDefaultPayload(predefinedDefaultPayloads)

    // get door id
    const doorIdAnswer = await inquirer.prompt({
        type: 'input',
        name: 'doorId',
        message: 'Enter door id:',
        default: 'cbec28e2-e829-4c2d-9911-53cb3a45a547'
    });

    // 1. instructions page
    const door = await instructionsPage(doorIdAnswer.doorId);

    if (!door) {
        logger.error('Door not found');
        return;
    }

    const application = await createApplication(doorIdAnswer.doorId);
    const applicationId = application.application_id;
    logger.success(`Door found: ${door.door.address.address_line_1}, ${door.door.address.city}`);
    logger.success(`Application created with ApplicationId: ${applicationId}`);


    // 2. applicant page 
    const applicantPayload = await getApplicantPayload(applicationId, defaultPayloads);
    const applicantResponse = await applicantPage(applicantPayload);

    if (!applicantResponse) {
        logger.error('Applicant not created');
        return;
    }
    logger.success('Applicant created successfully');
    logger.info(`Application Person ID: ${applicantResponse.application_person_id}`);


    // 3. application page

    const residencePayload = await getResidencePayload(applicantResponse.application_person_id, defaultPayloads);
    const residenceResponse = await residencePage(residencePayload);

    if (!residenceResponse) {
        logger.error('Residence not created');
        return;
    }
    logger.success(`Residence created successfully with ApplicantResidenceId: ${residenceResponse.applicant_residence_id}`);

    // 4. employment page 

    const employmentPayload = await getEmploymentPayload(applicantResponse.application_person_id, defaultPayloads);
    const employmentResponse = await employmentPage(employmentPayload);

    if (!employmentResponse) {
        logger.error('Employment not created');
        return;
    }
    logger.success(`Employment created successfully with ApplicantEmploymentId: ${employmentResponse.applicant_employment_id}`);

    // 5. background check page

    const backgroundCheckPayload = await getBackgroundCheckPayload(applicantResponse.application_person_id, defaultPayloads);
    const backgroundCheckResponse = await backgroundCheckPage(backgroundCheckPayload);

    if (!backgroundCheckResponse) {
        logger.error('Background check not created');
        return;
    }

    logger.success(`Background check created successfully with BackgroundCheckId: ${backgroundCheckResponse.applicant_background_info_id}`);

    // 6. add-ons page

    const addOnsPayload = await getAddOnsPayload(defaultPayloads);
    const addOnsResponse = await addOnsPage(addOnsPayload, applicantResponse.application_person_id);

    if (!addOnsResponse) {
        logger.error('Add-ons not created');
        return;
    }
    logger.success('Add-ons created successfully');

    // 7. application confirmation 
    logger.success('Application process completed successfully');

    const confirmationResponse = await applicationConfirmation(applicantResponse.application_person_id);

    if (!confirmationResponse) {
        logger.error('Application confirmation failed');
        return;
    }

    logger.success('Application confirmed successfully');

    const applicantUrl = `https://pm.purepm.dev/leasing/applicant/${applicantResponse.application_person_id}/application-overview`;
    logger.info(`Applicant URL: ${applicantUrl}`);

    const applicationUrl = `https://pm.purepm.dev/leasing/applications/${applicationId}`;
    logger.info(`Application URL: ${applicationUrl}`);

}


// 1. Instructions Page // get details of the door
const instructionsPage = async (doorId) => {

    const { headers, leasingUrl } = getEnvironment();
    const url = `${leasingUrl}/door/${doorId}/detailed`;

    try {
        const response = await axios.get(url, { headers })
        return response.data;
    } catch (error) {
        logger.error(`Error fetching door details: ${error.message}`);
        return null;
    }
}

const createApplication = async (doorId) => {

    const { headers, leasingUrl } = getEnvironment();
    const url = `${leasingUrl}/lease-application`

    try {
        const response = await axios.post(url, {
            door_id: doorId
        }, { headers })
        return response.data;
    }
    catch (error) {
        logger.error(`Error creating application: ${error.message}`);
        return null;
    }

}

// 2. Applicant Page // get details of the applicant
const getApplicantPayload = async (applicationId, defaultPayloads) => {
    const applicantPayload = defaultPayloads.APPLICATION_PAGE_PAYLOAD;

    applicantPayload.move_in_date = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();
    applicantPayload.application_id = applicationId;

    const applicantAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter first name:',
            default: applicantPayload.first_name
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter last name:',
            default: applicantPayload.last_name
        },
        {
            type: 'input',
            name: 'email',
            message: 'Enter email:',
            default: applicantPayload.email
        },
        {
            type: 'input',
            name: 'phone_number',
            message: 'Enter phone number:',
            default: applicantPayload.primary_phone.phone_number
        },
        {
            type: 'input',
            name: 'social_security_number',
            message: 'Enter social security number:',
            default: applicantPayload.social_security_number
        },
        {
            type: 'input',
            name: 'date_of_birth',
            message: 'Enter date of birth:',
            default: applicantPayload.date_of_birth
        },
    ]);

    applicantPayload.first_name = applicantAnswer.first_name;
    applicantPayload.last_name = applicantAnswer.last_name;
    applicantPayload.email = applicantAnswer.email;
    applicantPayload.primary_phone.phone_number = applicantAnswer.phone_number;
    applicantPayload.social_security_number = applicantAnswer.social_security_number;
    applicantPayload.date_of_birth = applicantAnswer.date_of_birth;

    return applicantPayload;
}

const applicantPage = async (applicantPayload) => {
    const { headers, leasingUrl } = getEnvironment();
    const applicationPersonId = uuidv4();
    const url = `${leasingUrl}/application-person/${applicationPersonId}`;

    try {
        const response = await axios.put(url, applicantPayload, { headers })
        return response.data;
    } catch (error) {
        logger.error(`Error creating applicant: ${error.message}`);
        return null;
    }
}

// 3. residence page 
const getResidencePayload = async (applicationId, defaultPayloads) => {
    const residencePayload = defaultPayloads.RESIDENCE_PAGE_PAYLOAD

    residencePayload.application_person_id = applicationId;

    const residenceAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'address_line_1',
            message: 'Enter address line 1:',
            default: residencePayload.address_line_1
        },
        {
            type: 'input',
            name: 'address_line_2',
            message: 'Enter address line 2:',
            default: residencePayload.address_line_2
        },
        {
            type: 'input',
            name: 'city',
            message: 'Enter city:',
            default: residencePayload.city
        },
        {
            type: 'input',
            name: 'state_abv',
            message: 'Enter state abbreviation:',
            default: residencePayload.state_abv
        },
        {
            type: 'input',
            name: 'postal_code',
            message: 'Enter postal code:',
            default: residencePayload.postal_code
        },
        {
            type: 'input',
            name: 'county',
            message: 'Enter county:',
            default: residencePayload.county
        },
    ]);

    residencePayload.address_line_1 = residenceAnswer.address_line_1;
    residencePayload.address_line_2 = residenceAnswer.address_line_2;
    residencePayload.city = residenceAnswer.city;
    residencePayload.state_abv = residenceAnswer.state_abv;
    residencePayload.postal_code = residenceAnswer.postal_code;
    residencePayload.county = residenceAnswer.county;

    return residencePayload;
}

const residencePage = async (residencePayload) => {
    const { headers, leasingUrl } = getEnvironment();
    const applicantResidenceId = uuidv4();
    const url = `${leasingUrl}/applicant-residence/${applicantResidenceId}`

    try {
        const response = await axios.put(url, residencePayload, { headers })
        return response.data;
    }
    catch (error) {
        logger.error(`Error creating residence: ${error.message}`);
        return null;
    }

}

// 4. employment page

const getEmploymentPayload = async (applicationPersonId, defaultPayloads) => {

    const employmentPayload = defaultPayloads.EMPLOYMENT_PAGE_PAYLOAD;
    employmentPayload.application_person_id = applicationPersonId;

    const employmentAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'employer',
            message: 'Enter employer:',
            default: employmentPayload.employer
        },
        {
            type: 'input',
            name: 'years_employed',
            message: 'Enter years employed:',
            default: employmentPayload.years_employed
        },
        {
            type: 'input',
            name: 'gross_income',
            message: 'Enter gross income:',
            default: employmentPayload.gross_income
        },
    ]);

    employmentPayload.employer = employmentAnswer.employer;
    employmentPayload.employment_start_date = employmentAnswer.employment_start_date;
    employmentPayload.years_employed = employmentAnswer.years_employed;
    employmentPayload.gross_income = employmentAnswer.gross_income;

    // start date employmentAnswer.years_employed years ago
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - employmentAnswer.years_employed));
    employmentPayload.employment_start_date = startDate.toISOString();

    return employmentPayload;
}

const employmentPage = async (employmentPayload) => {
    const { headers, leasingUrl } = getEnvironment();
    const applicantEmploymentId = uuidv4();
    const url = `${leasingUrl}/applicant-employment/${applicantEmploymentId}`

    try {
        const response = await axios.put(url, employmentPayload, { headers })
        return response.data;
    }
    catch (error) {
        logger.error(`Error creating employment: ${error.message}`);
        return null;
    }
}

// 5. background check page

const getBackgroundCheckPayload = async (applicationPersonId, defaultPayloads) => {

    const backgroundCheckPayload = defaultPayloads.BACKGROUND_CHECK_PAGE_PAYLOAD;
    backgroundCheckPayload.application_person_id = applicationPersonId;

    const backgroundCheckAnswer = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'has_been_evicted',
            message: 'Have you ever been evicted?',
            default: backgroundCheckPayload.has_been_evicted
        },
        {
            type: 'confirm',
            name: 'has_criminal_charges',
            message: 'Have you ever had criminal charges?',
            default: backgroundCheckPayload.has_criminal_charges
        },
        {
            type: 'confirm',
            name: 'has_civil_charges',
            message: 'Have you ever had civil charges?',
            default: backgroundCheckPayload.has_civil_charges
        },
        {
            type: 'input',
            name: 'reference1Name',
            message: 'Enter reference 1 name:',
            default: backgroundCheckPayload.reference[0].name
        },
        {
            type: 'input',
            name: 'reference1Phone',
            message: 'Enter reference 1 phone:',
            default: backgroundCheckPayload.reference[0].phone
        },
        {
            type: 'input',
            name: 'reference2Name',
            message: 'Enter reference 2 name:',
            default: backgroundCheckPayload.reference[1].name
        },
        {
            type: 'input',
            name: 'reference2Phone',
            message: 'Enter reference 2 phone:',
            default: backgroundCheckPayload.reference[1].phone
        },
    ]);

    backgroundCheckPayload.has_been_evicted = backgroundCheckAnswer.has_been_evicted;
    backgroundCheckPayload.has_criminal_charges = backgroundCheckAnswer.has_criminal_charges;
    backgroundCheckPayload.has_civil_charges = backgroundCheckAnswer.has_civil_charges;
    backgroundCheckPayload.reference[0].name = backgroundCheckAnswer.reference1Name;
    backgroundCheckPayload.reference[0].phone = backgroundCheckAnswer.reference1Phone;
    backgroundCheckPayload.reference[1].name = backgroundCheckAnswer.reference2Name;
    backgroundCheckPayload.reference[1].phone = backgroundCheckAnswer.reference2Phone;

    return backgroundCheckPayload;
}

const backgroundCheckPage = async (backgroundCheckPayload) => {
    const { headers, leasingUrl } = getEnvironment();
    const backgroundCheckId = uuidv4();
    const url = `${leasingUrl}/applicant-background-info/${backgroundCheckId}`

    try {
        const response = await axios.put(url, backgroundCheckPayload, { headers })
        return response.data;
    }
    catch (error) {
        logger.error(`Error creating background check: ${error.message}`);
        return null;
    }
}

// 6. add-ons page

const getAddOnsPayload = async (defaultPayloads) => {
    return defaultPayloads.ADD_ONS_PAGE_PAYLOAD;
}

const addOnsPage = async (addOnsPayload, applicationPersonId) => {
    const { headers, leasingUrl } = getEnvironment();
    const url = `${leasingUrl}/applicant-add-ons/${applicationPersonId}`

    try {
        const response = await axios.put(url, addOnsPayload, { headers })
        return response.data;
    }
    catch (error) {
        logger.error(`Error creating add-ons: ${error.message}`);
        return null;
    }
}

// 7. application confirmation request 

const applicationConfirmation = async (applicationPersonId) => {
    const { headers, leasingUrl } = getEnvironment();

    const url = `${leasingUrl}/application-confirmation/${applicationPersonId}`

    try {
        await axios.post(url, {}, { headers })
        return true;
    }
    catch (error) {
        logger.error(`Error confirming application: ${error.message}`);
        return null;
    }
}
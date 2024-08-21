import { v4 as uuidv4 } from 'uuid';

function generateRandomEmail() {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let username = '';

    for (let i = 0; i < 10; i++) {
        username += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const domain = domains[Math.floor(Math.random() * domains.length)];

    return `${username}@${domain}`;
}

export const APPLICATION_PAGE_PAYLOAD = {
    "application_id": uuidv4(),
    "application_person_type_id": "2ee4160e-e770-4bcc-8c0f-7a66a563b539",
    "suffix": "",
    // used for transunion requests
    "first_name": "Ila",
    "middle_name": "Mae",
    "last_name": "Sorensen",
    "social_security_number": "666175635",
    "date_of_birth": "03-01-1960",
    // --------------------------
    "maiden_name": "",
    "email": generateRandomEmail(),
    "primary_phone": {
        "phone_number": "3035551212",
        "country_code": "USA",
        "country_id": "a54015f7-6c2c-4ccd-b755-8f6229430757",
        "phone_country_code": "1",
        "opt_in_texting": true,
        "type": "Home",
        "phone_type_id": "0e5e63c8-00e7-4bea-8e09-81787ea0e3a6"
    },
    "driver_license_number": "12313322",
    "driver_license_state": "AR",
    "requested_report_copy": false,
    "is_smoker": false,
    "co_applicants": [],
    "is_cosigner": false,
    "move_in_date": "2024-12-21T00:00:00.000Z"
}

export const RESIDENCE_PAGE_PAYLOAD = {
    "is_current": true,
    "application_person_id": "a6430f80-393f-447c-be96-42ade81d1b3c",
    "is_rented": true,
    // used for transunion requests
    "address_line_1": "280 Rocco Dr.",
    "address_line_2": "Apt B",
    "city": "Harrisonburg",
    "state_abv": "VA",
    "postal_code": "22801",
    // --------------------------
    "country_abv": "USA",
    "county": "New York",
    "landlord_first_name": null,
    "landlord_last_name": null,
    "landlord_email": null,
    "landlord_phone": null,
    "amount": null,
    "move_in_date": null
};

export const EMPLOYMENT_PAGE_PAYLOAD = {
    "application_person_id": "a6430f80-393f-447c-be96-42ade81d1b3c",
    "payment_period_id": "cdfa9057-76e1-4010-b43c-73494266cc97",
    "income_source_id": "eef7a47c-1b55-407b-a5d3-56041dc2b998",
    "employer": "Google Inc",
    "employment_start_date": "2021-06-22T08:05:37.204Z",
    "years_employed": 3,
    "gross_income": 3500,
    "is_primary": true
}

export const BACKGROUND_CHECK_PAGE_PAYLOAD = {
    "application_person_id": "a6430f80-393f-447c-be96-42ade81d1b3c",
    "has_been_evicted": false,
    "has_criminal_charges": false,
    "has_civil_charges": false,
    "reference": [
        {
            "name": "Hellen Clark",
            "phone": "3035551211"
        },
        {
            "name": "Sophia Bullet",
            "phone": "3035551213"
        }
    ],
    "dependants": []
}

export const ADD_ONS_PAGE_PAYLOAD = {
    "resident_benefit_package_id": "70863a0c-fcbc-4620-9b8e-ea10b49205d5",
    "security_deposit_rp_opt_in": true,
    "security_deposit_rp_id": "9c148182-7942-4bcd-8a18-86020cffa69e"
}

# Pure CLI

A command-line interface (CLI) tool designed for managing leasing applications with integrations for TransUnion screening and automated payload processing.

## Features

- Module-based structure for handling leasing and core functionalities.
- Automated payload generation for leasing applications.
- Integration with TransUnion for criminal and eviction phased screening.
- Extensive logging with color-coded output using `chalk`.

## Project Structure

The project is structured as follows:

```
pure-cli/
├── core/
├── create-application/
├── helpers/
│   └── logger.js
├── leasing/
├── transunion/
├── payloads.js
├── default-payload.js
├── package.json
└── index.js
```

## Getting Started

### Prerequisites

- Node.js (>= v14)
- npm (>= v6)

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/pure-cli.git
cd pure-cli
```

Install dependencies:

```bash
npm install
```

### Usage

To start the CLI:

```bash
node index.js
```

The CLI will prompt you to choose a module and options based on the selected module.

### Available Modules

1. **Leasing Module:** Handles leasing applications and allows interaction with TransUnion screening options.
2. **Core Module:** Placeholder for core functionalities (expandable).

### TransUnion Module

The TransUnion module allows you to select predefined payloads for different screening types like:
- **ACCEPT Screening**
- **CRIMINAL Phased Screening**
- **EVICTION Phased Screening**
- **DECLINE Screening**
- **REFER Screening**

### Payload Management

The payloads used for applications are defined in `default-payload.js` and `payloads.js`. You can customize the payloads before running the CLI.

### Logger

A custom logger is used for structured and color-coded console output. Logging methods include:
- `info`
- `warn`
- `error`
- `success`
- `debug`

### Example Run

```bash
$ node index.js
```

Follow the prompts to select a module and execute the corresponding script.

## Configuration

Ensure that environment variables for your TransUnion integration are set before running the CLI. You can configure these in `Doppler` or your preferred secret management tool.

## Contributing

Feel free to submit issues and pull requests to enhance the CLI or add new features.

## License

This project is licensed under the ISC License.

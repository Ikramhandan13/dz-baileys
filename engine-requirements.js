if (typeof Bun === 'undefined') {
    console.error(
        "\n========================================\n" +
        " This application requires Bun runtime    \n" +
        "----------------------------------------\n" +
        "   You are not running with Bun\n" +
        "   Please use: bun run [your-script]\n" +
        "========================================\n"
    );
    process.exit(1);
}

const bunVersion = Bun.version;
const major = parseInt(bunVersion.split(".")[0], 10);
const minor = parseInt(bunVersion.split(".")[1], 10);

if (major < 1 || (major === 1 && minor < 3)) {
    console.error(
        "\n========================================\n" +
        " DzBailey requires Bun 1.3+ to run       \n" +
        "----------------------------------------\n" +
        `   You are using Bun ${bunVersion}\n` +
        "   Please upgrade to Bun 1.3+ to proceed.\n" +
        "========================================\n"
    );
    process.exit(1);
}

console.log(`✓ Running with Bun ${bunVersion}`);
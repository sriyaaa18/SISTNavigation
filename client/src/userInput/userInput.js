import { submitUser } from "../../services/service.js";

const form = document.getElementById('userForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const aadhaarInput = document.getElementById('aadhaar');

window.addEventListener('load', () => {
    form.reset();
    clearErrors();
});

nameInput.addEventListener('input', validateName);
phoneInput.addEventListener('input', validatePhone);
aadhaarInput.addEventListener('input', validateAadhaar);

function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
        showError(nameInput, 'Name is required');
        return false;
    }
    if (value.length < 2) {
        showError(nameInput, 'Name must be at least 2 characters');
        return false;
    }
    clearError(nameInput);
    return true;
}

function validatePhone() {
    const value = phoneInput.value.trim();
    if (!value) {
        showError(phoneInput, 'Phone number is required');
        return false;
    }
    if (!/^\d{10}$/.test(value)) {
        showError(phoneInput, 'Must be 10 digits');
        return false;
    }
    clearError(phoneInput);
    return true;
}

function validateAadhaar() {
    const value = aadhaarInput.value.trim();
    if (!value) {
        showError(aadhaarInput, 'Aadhaar number is required');
        return false;
    }
    if (!/^\d{12}$/.test(value)) {
        showError(aadhaarInput, 'Must be 12 digits');
        return false;
    }
    clearError(aadhaarInput);
    return true;
}

function showError(input, message) {
    const formControl = input.parentElement;
    const errorDisplay = formControl.querySelector('.error') || createErrorElement(formControl);
    errorDisplay.textContent = message;
    input.classList.add('invalid');
}

function clearError(input) {
    const formControl = input.parentElement;
    const errorDisplay = formControl.querySelector('.error');
    if (errorDisplay) errorDisplay.remove();
    input.classList.remove('invalid');
}

function clearErrors() {
    [nameInput, phoneInput, aadhaarInput].forEach(input => {
        clearError(input);
    });
}

function createErrorElement(formControl) {
    const errorDisplay = document.createElement('small');
    errorDisplay.className = 'error';
    formControl.appendChild(errorDisplay);
    return errorDisplay;
}

// Custom alert system
function showAlert(type, message) {
    const alertBox = document.createElement('div');
    alertBox.className = `custom-alert ${type}`;
    alertBox.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">${type === 'success' ? '✓' : '⚠'}</span>
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.classList.add('show');
    }, 10);

    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => {
            alertBox.remove();
        }, 300);
    }, 3000);
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate all fields
    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isAadhaarValid = validateAadhaar();

    if (!isNameValid || !isPhoneValid || !isAadhaarValid) {
        showAlert('error', 'Please fix all errors before submitting');
        return;
    }

    const userData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        aadhaar: aadhaarInput.value.trim()
    };

    try {
        const response = await submitUser(userData);
        console.log('Submission successful:', response);

        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userPhone', userData.phone);

        showAlert('success', 'Data submitted successfully!');

        form.reset();

        setTimeout(() => {
            window.location.href = "../userpage/user.html";
        }, 1500);

    } catch (err) {
        console.error('Submission error:', err);
        showAlert('error', err.message || 'Failed to submit. Please try again.');
    }
});
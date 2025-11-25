// Generate unique 6-digit booking number
export const generateBookingNumber = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const bookingNumber = (timestamp.slice(-3) + random).slice(0, 6);
    return bookingNumber.padStart(6, '0');
};

// Validate booking number format
export const isValidBookingNumber = (number: string): boolean => {
    return /^\d{6}$/.test(number);
};

// Check if booking number exists
export const bookingNumberExists = (number: string): boolean => {
    const bookings = localStorage.getItem('bookings');
    if (!bookings) return false;

    const bookingList = JSON.parse(bookings);
    return bookingList.some((b: any) => b.bookingNumber === number);
};

// Generate unique booking number (ensures uniqueness)
export const generateUniqueBookingNumber = (): string => {
    let bookingNumber = generateBookingNumber();
    let attempts = 0;

    while (bookingNumberExists(bookingNumber) && attempts < 100) {
        bookingNumber = generateBookingNumber();
        attempts++;
    }

    return bookingNumber;
};

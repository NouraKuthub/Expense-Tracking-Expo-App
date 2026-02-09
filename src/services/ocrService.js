const API_KEY = 'helloworld';
const OCR_API_URL = 'https://api.ocr.space/parse/image';

export const extractAmountFromImage = async (imageUri) => {
    try {
        const formData = new FormData();
        formData.append('apikey', API_KEY);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('file', {
            uri: imageUri,
            name: 'image.jpg',
            type: 'image/jpeg',
        });

        const response = await fetch(OCR_API_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const result = await response.json();

        if (result.IsErroredOnProcessing) {
            throw new Error(result.ErrorMessage);
        }

        if (result.ParsedResults && result.ParsedResults.length > 0) {
            const text = result.ParsedResults[0].ParsedText;
            console.log("OCR Extracted Text:", text); // For debugging
            return parseAmountFromText(text);
        }

        return null;
    } catch (error) {
        console.error("OCR Error:", error);
        throw error;
    }
};

const parseAmountFromText = (text) => {
    const lines = text.split('\n');
    let maxAmount = 0.0;


    let bestTotalCandidate = null;
    let bestTotalPriority = -1;
    const amountRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
    const highPriorityKeywords = ['grand total', 'total amount', 'amount payable'];
    const mediumPriorityKeywords = ['total', 'balance', 'due', 'payable'];
    const ignoreKeywords = ['ph:', 'phone', 'gst', 'tin', 'bill no', 'item', 'qty', 'price', 'date', 'thank you'];

    for (let line of lines) {
        let lowerLine = line.toLowerCase();

        // Determine line priority
        let currentPriority = 0;

        if (highPriorityKeywords.some(kw => lowerLine.includes(kw))) {
            currentPriority = 3;
        } else if (mediumPriorityKeywords.some(kw => lowerLine.includes(kw))) {
            currentPriority = 2;
        }

        const shouldIgnore = currentPriority === 0 && ignoreKeywords.some(kw => lowerLine.includes(kw));

        if (shouldIgnore) continue;

        const matches = line.match(amountRegex);
        if (matches) {
            for (let match of matches) {
                const cleanMatch = match.replace(/,/g, '');
                const val = parseFloat(cleanMatch);
                if (isNaN(val)) continue;
                if (val > 1000000) continue;
                if (currentPriority > 0) {
                    if (currentPriority > bestTotalPriority) {
                        bestTotalCandidate = val;
                        bestTotalPriority = currentPriority;
                    } else if (currentPriority === bestTotalPriority) {
                        if (val > bestTotalCandidate) {
                            bestTotalCandidate = val;
                        }
                    }
                } else {
                    if (val > maxAmount) {
                        maxAmount = val;
                    }
                }
            }
        }
    }

    if (bestTotalCandidate !== null) {
        return bestTotalCandidate.toFixed(2);
    }

    return maxAmount > 0 ? maxAmount.toFixed(2) : null;
};

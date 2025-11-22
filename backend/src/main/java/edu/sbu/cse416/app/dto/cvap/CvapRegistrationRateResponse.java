package edu.sbu.cse416.app.dto.cvap;

public record CvapRegistrationRateResponse(
        Double registrationRate,
        String label) {
    
    public static String getDefaultLabel() {
        return "Average Rate";
    }
}

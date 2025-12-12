package edu.sbu.cse416.app.dto.equipment;

/**
 * Quadratic regression coefficients for y = ax² + bx + c.
 * Used to draw the non-linear regression lines on the bubble chart.
 */
public record RegressionCoefficientsDTO(double a, double b, double c) {}

package edu.sbu.cse416.app.util;

import java.util.HashMap;
import java.util.Map;

public class FipsUtil {

    private static final Map<String, String> STATE_FIPS_MAP = new HashMap<>();
    private static final Map<String, String> STATE_ABBR_MAP = new HashMap<>();

    static {
        addState("01", "ALABAMA", "AL");
        addState("02", "ALASKA", "AK");
        addState("04", "ARIZONA", "AZ");
        addState("05", "ARKANSAS", "AR");
        addState("06", "CALIFORNIA", "CA");
        addState("08", "COLORADO", "CO");
        addState("09", "CONNECTICUT", "CT");
        addState("10", "DELAWARE", "DE");
        addState("11", "DISTRICT OF COLUMBIA", "DC");
        addState("12", "FLORIDA", "FL");
        addState("13", "GEORGIA", "GA");
        addState("15", "HAWAII", "HI");
        addState("16", "IDAHO", "ID");
        addState("17", "ILLINOIS", "IL");
        addState("18", "INDIANA", "IN");
        addState("19", "IOWA", "IA");
        addState("20", "KANSAS", "KS");
        addState("21", "KENTUCKY", "KY");
        addState("22", "LOUISIANA", "LA");
        addState("23", "MAINE", "ME");
        addState("24", "MARYLAND", "MD");
        addState("25", "MASSACHUSETTS", "MA");
        addState("26", "MICHIGAN", "MI");
        addState("27", "MINNESOTA", "MN");
        addState("28", "MISSISSIPPI", "MS");
        addState("29", "MISSOURI", "MO");
        addState("30", "MONTANA", "MT");
        addState("31", "NEBRASKA", "NE");
        addState("32", "NEVADA", "NV");
        addState("33", "NEW HAMPSHIRE", "NH");
        addState("34", "NEW JERSEY", "NJ");
        addState("35", "NEW MEXICO", "NM");
        addState("36", "NEW YORK", "NY");
        addState("37", "NORTH CAROLINA", "NC");
        addState("38", "NORTH DAKOTA", "ND");
        addState("39", "OHIO", "OH");
        addState("40", "OKLAHOMA", "OK");
        addState("41", "OREGON", "OR");
        addState("42", "PENNSYLVANIA", "PA");
        addState("44", "RHODE ISLAND", "RI");
        addState("45", "SOUTH CAROLINA", "SC");
        addState("46", "SOUTH DAKOTA", "SD");
        addState("47", "TENNESSEE", "TN");
        addState("48", "TEXAS", "TX");
        addState("49", "UTAH", "UT");
        addState("50", "VERMONT", "VT");
        addState("51", "VIRGINIA", "VA");
        addState("53", "WASHINGTON", "WA");
        addState("54", "WEST VIRGINIA", "WV");
        addState("55", "WISCONSIN", "WI");
        addState("56", "WYOMING", "WY");

        // Territories
        addState("60", "AMERICAN SAMOA", "AS");
        addState("66", "GUAM", "GU");
        addState("69", "NORTHERN MARIANA ISLANDS", "MP");
        addState("72", "PUERTO RICO", "PR");
        addState("78", "U.S. VIRGIN ISLANDS", "VI");
    }

    private static void addState(String fips, String name, String abbr) {
        STATE_FIPS_MAP.put(fips, name);
        STATE_ABBR_MAP.put(fips, abbr);
    }

    public static String getStateName(String fipsPrefix) {
        if (fipsPrefix == null || fipsPrefix.length() < 2) {
            return null;
        }
        String stateFips = fipsPrefix.substring(0, 2);
        return STATE_FIPS_MAP.get(stateFips);
    }

    public static String getStateAbbr(String fipsPrefix) {
        if (fipsPrefix == null || fipsPrefix.length() < 2) {
            return null;
        }
        String stateFips = fipsPrefix.substring(0, 2);
        return STATE_ABBR_MAP.get(stateFips);
    }
}

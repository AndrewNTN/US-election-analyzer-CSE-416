package edu.sbu.cse416.app.dto;

import java.util.List;

public record StateWithJurisdictions(StateEavsData stateData, List<JurisdictionSummary> jurisdictions) {}

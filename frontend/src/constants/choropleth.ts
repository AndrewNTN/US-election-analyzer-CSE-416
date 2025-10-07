// Choropleth visualization options for splash page
export const SPLASH_CHOROPLETH_OPTIONS = {
  POLITICAL: "political",
  DENSITY: "density",
  EQUIPMENT_AGE: "equipment_age",
  OFF: "off",
} as const;

// Choropleth visualization options for state analysis (detailed states)
export const STATE_CHOROPLETH_OPTIONS = {
  PROVISIONAL_BALLOTS: "provisional_ballots",
  ACTIVE_VOTERS: "active_voters",
  POLLBOOK_DELETIONS: "pollbook_deletions",
  MAIL_BALLOTS_REJECTED: "mail_ballots_rejected",
  VOTER_REGISTRATION: "voter_registration",
  VOTING_EQUIPMENT_TYPE: "voting_equipment_type",
  OFF: "off",
} as const;

export type SplashChoroplethOption =
  (typeof SPLASH_CHOROPLETH_OPTIONS)[keyof typeof SPLASH_CHOROPLETH_OPTIONS];

export type StateChoroplethOption =
  (typeof STATE_CHOROPLETH_OPTIONS)[keyof typeof STATE_CHOROPLETH_OPTIONS];

export type ChoroplethOption = SplashChoroplethOption | StateChoroplethOption;

export const SPLASH_CHOROPLETH_LABELS: Record<SplashChoroplethOption, string> =
  {
    [SPLASH_CHOROPLETH_OPTIONS.POLITICAL]: "Political Leaning",
    [SPLASH_CHOROPLETH_OPTIONS.DENSITY]: "Population Density",
    [SPLASH_CHOROPLETH_OPTIONS.EQUIPMENT_AGE]: "Voting Equipment Age",
    [SPLASH_CHOROPLETH_OPTIONS.OFF]: "Off",
  };

export const STATE_CHOROPLETH_LABELS: Record<StateChoroplethOption, string> = {
  [STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS]: "Provisional Ballots",
  [STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS]: "2024 EAVS Active Voters",
  [STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS]: "2024 EAVS Pollbook Deletions",
  [STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED]: "Mail Ballots Rejected",
  [STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION]: "Voter Registration",
  [STATE_CHOROPLETH_OPTIONS.VOTING_EQUIPMENT_TYPE]: "Voting Equipment Type",
  [STATE_CHOROPLETH_OPTIONS.OFF]: "Off",
};

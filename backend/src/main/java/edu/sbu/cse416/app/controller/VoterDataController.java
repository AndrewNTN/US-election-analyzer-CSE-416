package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.dto.activevoters.ActiveVotersChartResponse;
import edu.sbu.cse416.app.dto.activevoters.ActiveVotersTableResponse;
import edu.sbu.cse416.app.dto.cvap.CvapRegistrationRateResponse;
import edu.sbu.cse416.app.dto.dropbox.DropBoxVotingData;
import edu.sbu.cse416.app.dto.earlyvoting.EarlyVotingComparisonResponse;
import edu.sbu.cse416.app.dto.equipment.EquipmentQualityChartResponse;
import edu.sbu.cse416.app.dto.equipment.EquipmentSummaryResponse;
import edu.sbu.cse416.app.dto.equipment.StateEquipmentSummaryResponse;
import edu.sbu.cse416.app.dto.gingles.GinglesChartResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedChartResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedTableResponse;
import edu.sbu.cse416.app.dto.optinoptout.OptInOptOutComparisonResponse;
import edu.sbu.cse416.app.dto.pollbook.PollbookDeletionsChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalTableResponse;
import edu.sbu.cse416.app.dto.statecomparison.StateComparisonResponse;
import edu.sbu.cse416.app.dto.voter.FloridaVotersResponse;
import edu.sbu.cse416.app.dto.voterregistration.VoterRegistrationChartResponse;
import edu.sbu.cse416.app.dto.voterregistration.VoterRegistrationTableResponse;
import edu.sbu.cse416.app.dto.votingequipment.CountyEquipmentTypeResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentChartResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentTableResponse;
import edu.sbu.cse416.app.service.VoterDataService;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class VoterDataController {

    private final VoterDataService voterDataService;

    public VoterDataController(VoterDataService voterDataService) {
        this.voterDataService = voterDataService;
    }

    /**
     * Get Provisional voting data for a specific state by FIPS prefix.
     * GET /provisional/table/{fipsPrefix}
     */
    @GetMapping("/provisional/table/{fipsPrefix}")
    public ResponseEntity<ProvisionalTableResponse> getProvisionalTable(@PathVariable String fipsPrefix) {
        var response = voterDataService.getProvisionalTable(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get Provisional voting data for a specific state by FIPS prefix.
     * GET /provisional/chart/{fipsPrefix}
     */
    @GetMapping("/provisional/chart/{fipsPrefix}")
    public ResponseEntity<ProvisionalChartResponse> getProvisionalChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getProvisionalChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get Active voters data for a specific state by FIPS prefix.
     * GET /active-voters/table/{fipsPrefix}
     */
    @GetMapping("/active-voters/table/{fipsPrefix}")
    public ResponseEntity<ActiveVotersTableResponse> getActiveVotersTable(@PathVariable String fipsPrefix) {
        var response = voterDataService.getActiveVotersTable(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get Active voters data for a specific state by FIPS prefix.
     * GET /active-voters/chart/{fipsPrefix}
     */
    @GetMapping("/active-voters/chart/{fipsPrefix}")
    public ResponseEntity<ActiveVotersChartResponse> getActiveVotersChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getActiveVotersChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get Pollbook deletions data for a specific state by FIPS prefix.
     * GET /pollbook-deletions/chart/{fipsPrefix}
     */
    @GetMapping("pollbook-deletions/chart/{fipsPrefix}")
    public ResponseEntity<PollbookDeletionsChartResponse> getPollbookDeletionsChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getPollbookDeletionsChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get Mail ballots rejected data for a specific state by FIPS prefix.
     * GET /mail-ballots-rejected/table/{fipsPrefix}
     */
    @GetMapping("mail-ballots-rejected/table/{fipsPrefix}")
    public ResponseEntity<MailBallotsRejectedTableResponse> getMailBallotsRejectedTable(
            @PathVariable String fipsPrefix) {
        var dto = voterDataService.getMailBallotsRejectedTable(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get Mail ballots rejected data for a specific state by FIPS prefix.
     * GET /mail-ballots-rejected/chart/{fipsPrefix}
     */
    @GetMapping("mail-ballots-rejected/chart/{fipsPrefix}")
    public ResponseEntity<MailBallotsRejectedChartResponse> getMailBallotsRejectedChart(
            @PathVariable String fipsPrefix) {
        var dto = voterDataService.getMailBallotsRejectedChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get Voter registration data for a specific state by FIPS prefix.
     * GET /voter-registration/table/{stateFips}
     */
    @GetMapping("voter-registration/table/{stateFips}")
    public ResponseEntity<VoterRegistrationTableResponse> getVoterRegistrationTable(@PathVariable String stateFips) {
        var dto = voterDataService.getVoterRegistrationTable(stateFips);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get Voter registration data for a specific state by FIPS prefix.
     * GET /voter-registration/chart/{fipsPrefix}
     */
    @GetMapping("voter-registration/chart/{fipsPrefix}")
    public ResponseEntity<VoterRegistrationChartResponse> getVoterRegistrationChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getVoterRegistrationChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get Voting equipment data for all states.
     * GET /voting-equipment/table
     */
    @GetMapping("/voting-equipment/table")
    public ResponseEntity<VotingEquipmentTableResponse> getVotingEquipmentTable() {
        var dto = voterDataService.getVotingEquipmentTable();
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get Voting equipment data for a specific state by FIPS prefix.
     * GET /voting-equipment/chart/{fipsPrefix}
     */
    @GetMapping("/voting-equipment/chart/{fipsPrefix}")
    public ResponseEntity<VotingEquipmentChartResponse> getVotingEquipmentChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getVotingEquipmentChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    /**
     * Get county-level voting equipment types for a specific state by FIPS prefix.
     * GET /voting-equipment/types/{fipsPrefix}
     */
    @GetMapping("/voting-equipment/types/{fipsPrefix}")
    public ResponseEntity<CountyEquipmentTypeResponse> getCountyEquipmentTypes(@PathVariable String fipsPrefix) {
        var response = voterDataService.getCountyEquipmentTypes(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get CVAP registration rate data for a specific state by FIPS prefix.
     * GET /cvap-registration-rate/{fipsPrefix}
     */
    @GetMapping("/cvap-registration-rate/{fipsPrefix}")
    public ResponseEntity<CvapRegistrationRateResponse> getCvapRegistrationRate(@PathVariable String fipsPrefix) {
        var response = voterDataService.getCvapRegistrationRate(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get State comparison data for specific states by FIPS prefix.
     * GET /state-comparison
     */
    @GetMapping("/state-comparison")
    public ResponseEntity<StateComparisonResponse> getStateComparison(
            @RequestParam String republicanStateFips, @RequestParam String democraticStateFips) {
        var response = voterDataService.getStateComparison(republicanStateFips, democraticStateFips);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get Early voting comparison data for specific states by FIPS prefix.
     * GET /early-voting-comparison
     */
    @GetMapping("/early-voting-comparison")
    public ResponseEntity<EarlyVotingComparisonResponse> getEarlyVotingComparison(
            @RequestParam String republicanStateFips, @RequestParam String democraticStateFips) {
        var response = voterDataService.getEarlyVotingComparison(republicanStateFips, democraticStateFips);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get Opt-in/opt-out comparison data for specific states by FIPS prefix.
     * GET /opt-in-opt-out-comparison
     */
    @GetMapping("/opt-in-opt-out-comparison")
    public ResponseEntity<OptInOptOutComparisonResponse> getOptInOptOutComparison(
            @RequestParam String optInFips,
            @RequestParam String optOutSameDayFips,
            @RequestParam String optOutNoSameDayFips) {
        var response = voterDataService.getOptInOptOutComparison(optInFips, optOutSameDayFips, optOutNoSameDayFips);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get Florida voters data for a specific county by name.
     * GET /florida-voters/{countyName}
     */
    @GetMapping("/florida-voters/{countyName}")
    public ResponseEntity<FloridaVotersResponse> getFloridaVoters(
            @PathVariable String countyName,
            @RequestParam(required = false) String party,
            @PageableDefault(size = 20) Pageable pageable) {
        FloridaVotersResponse voters = voterDataService.getFloridaVoters(countyName, party, pageable);
        return new ResponseEntity<>(voters, HttpStatus.OK);
    }

    /**
     * Get Drop box voting data for a specific state by FIPS prefix.
     * GET /drop-box-voting/{fipsPrefix}
     */
    @GetMapping("/drop-box-voting/{fipsPrefix}")
    public ResponseEntity<List<DropBoxVotingData>> getDropBoxVotingData(@PathVariable String fipsPrefix) {
        var response = voterDataService.getDropBoxVotingData(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get Gingles Chart data for a specific state by FIPS prefix.
     * Returns precinct-level voting data with demographics and regression curves.
     * GET /gingles-chart/{fipsPrefix}
     */
    @GetMapping("/gingles-chart/{fipsPrefix}")
    public ResponseEntity<GinglesChartResponse> getGinglesChart(@PathVariable String fipsPrefix) {
        var response = voterDataService.getGinglesChartData(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get equipment summary data for national overview.
     * GET /equipment-summary
     */
    @GetMapping("/equipment-summary")
    public ResponseEntity<EquipmentSummaryResponse> getEquipmentSummary() {
        var response = voterDataService.getEquipmentSummary();
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get state-level equipment summary data.
     * GET /state-equipment-summary/{stateFips}
     */
    @GetMapping("/state-equipment-summary/{stateFips}")
    public ResponseEntity<StateEquipmentSummaryResponse> getStateEquipmentSummary(@PathVariable String stateFips) {
        var response = voterDataService.getStateEquipmentSummary(stateFips);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    /**
     * Get equipment quality vs rejected ballots data for bubble chart.
     * Returns county-level data with regression coefficients for each party.
     * GET /equipment-quality-chart/{fipsPrefix}
     */
    @GetMapping("/equipment-quality-chart/{fipsPrefix}")
    public ResponseEntity<EquipmentQualityChartResponse> getEquipmentQualityChart(@PathVariable String fipsPrefix) {
        var response = voterDataService.getEquipmentQualityVsRejectedBallots(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }
}

package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.dto.activevoters.ActiveVotersChartResponse;
import edu.sbu.cse416.app.dto.activevoters.ActiveVotersTableResponse;
import edu.sbu.cse416.app.dto.cvap.CvapRegistrationRateResponse;
import edu.sbu.cse416.app.dto.earlyvoting.EarlyVotingComparisonResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedChartResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedTableResponse;
import edu.sbu.cse416.app.dto.optinoptout.OptInOptOutComparisonResponse;
import edu.sbu.cse416.app.dto.pollbook.PollbookDeletionsChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalTableResponse;
import edu.sbu.cse416.app.dto.statecomparison.StateComparisonResponse;
import edu.sbu.cse416.app.dto.voterregistration.VoterRegistrationChartResponse;
import edu.sbu.cse416.app.dto.voterregistration.VoterRegistrationTableResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentChartResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentTableResponse;
import edu.sbu.cse416.app.service.VoterDataService;
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

    @GetMapping("/provisional/table/{fipsPrefix}")
    public ResponseEntity<ProvisionalTableResponse> getProvisionalTable(@PathVariable String fipsPrefix) {
        var response = voterDataService.getProvisionalTable(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    @GetMapping("/provisional/chart/{fipsPrefix}")
    public ResponseEntity<ProvisionalChartResponse> getProvisionalChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getProvisionalChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("/active-voters/table/{fipsPrefix}")
    public ResponseEntity<ActiveVotersTableResponse> getActiveVotersTable(@PathVariable String fipsPrefix) {
        var response = voterDataService.getActiveVotersTable(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    @GetMapping("/active-voters/chart/{fipsPrefix}")
    public ResponseEntity<ActiveVotersChartResponse> getActiveVotersChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getActiveVotersChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("pollbook-deletions/chart/{fipsPrefix}")
    public ResponseEntity<PollbookDeletionsChartResponse> getPollbookDeletionsChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getPollbookDeletionsChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("mail-ballots-rejected/table/{fipsPrefix}")
    public ResponseEntity<MailBallotsRejectedTableResponse> getMailBallotsRejectedTable(
            @PathVariable String fipsPrefix) {
        var dto = voterDataService.getMailBallotsRejectedTable(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("mail-ballots-rejected/chart/{fipsPrefix}")
    public ResponseEntity<MailBallotsRejectedChartResponse> getMailBallotsRejectedChart(
            @PathVariable String fipsPrefix) {
        var dto = voterDataService.getMailBallotsRejectedChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("voter-registration/table/{stateFips}")
    public ResponseEntity<VoterRegistrationTableResponse> getVoterRegistrationTable(@PathVariable String stateFips) {
        var dto = voterDataService.getVoterRegistrationTable(stateFips);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("voter-registration/chart/{fipsPrefix}")
    public ResponseEntity<VoterRegistrationChartResponse> getVoterRegistrationChart(@PathVariable String fipsPrefix) {
        var dto = voterDataService.getVoterRegistrationChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("/voting-equipment/table")
    public ResponseEntity<VotingEquipmentTableResponse> getVotingEquipmentTable() {
        var dto = voterDataService.getVotingEquipmentTable();
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("/voting-equipment/chart")
    public ResponseEntity<VotingEquipmentChartResponse> getVotingEquipmentChart(@RequestParam String stateName) {
        var dto = voterDataService.getVotingEquipmentChart(stateName);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("/cvap-registration-rate/{fipsPrefix}")
    public ResponseEntity<CvapRegistrationRateResponse> getCvapRegistrationRate(@PathVariable String fipsPrefix) {
        var response = voterDataService.getCvapRegistrationRate(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    @GetMapping("/state-comparison")
    public ResponseEntity<StateComparisonResponse> getStateComparison(
            @RequestParam String republicanStateFips, @RequestParam String democraticStateFips) {
        var response = voterDataService.getStateComparison(republicanStateFips, democraticStateFips);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    @GetMapping("/early-voting-comparison")
    public ResponseEntity<EarlyVotingComparisonResponse> getEarlyVotingComparison(
            @RequestParam String republicanStateFips, @RequestParam String democraticStateFips) {
        var response = voterDataService.getEarlyVotingComparison(republicanStateFips, democraticStateFips);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    @GetMapping("/opt-in-opt-out-comparison")
    public ResponseEntity<OptInOptOutComparisonResponse> getOptInOptOutComparison(
            @RequestParam String optInFips,
            @RequestParam String optOutSameDayFips,
            @RequestParam String optOutNoSameDayFips) {
        var response = voterDataService.getOptInOptOutComparison(optInFips, optOutSameDayFips, optOutNoSameDayFips);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }
}

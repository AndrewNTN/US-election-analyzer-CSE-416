package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.dto.activevoters.ActiveVotersChartResponse;
import edu.sbu.cse416.app.dto.activevoters.ActiveVotersTableResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedChartResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedTableResponse;
import edu.sbu.cse416.app.dto.pollbook.PollbookDeletionsChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalTableResponse;
import edu.sbu.cse416.app.service.EavsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eavs")
public class EavsController {

    private final EavsService eavsService;

    public EavsController(EavsService eavsService) {
        this.eavsService = eavsService;
    }

    @GetMapping("/provisional/table/{fipsPrefix}")
    public ResponseEntity<ProvisionalTableResponse> getProvisionalTable(@PathVariable String fipsPrefix) {
        var response = eavsService.getProvisionalTable(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    @GetMapping("/provisional/chart/{fipsPrefix}")
    public ResponseEntity<ProvisionalChartResponse> getProvisionalChart(@PathVariable String fipsPrefix) {
        var dto = eavsService.getProvisionalChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("/active-voters/table/{fipsPrefix}")
    public ResponseEntity<ActiveVotersTableResponse> getActiveVotersTable(@PathVariable String fipsPrefix) {
        var response = eavsService.getActiveVotersTable(fipsPrefix);
        return (response == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    @GetMapping("/active-voters/chart/{fipsPrefix}")
    public ResponseEntity<ActiveVotersChartResponse> getActiveVotersChart(@PathVariable String fipsPrefix) {
        var dto = eavsService.getActiveVotersChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("pollbook-deletions/chart/{fipsPrefix}")
    public ResponseEntity<PollbookDeletionsChartResponse> getPollbookDeletionsChart(@PathVariable String fipsPrefix) {
        var dto = eavsService.getPollbookDeletionsChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("mail-ballots-rejected/table/{fipsPrefix}")
    public ResponseEntity<MailBallotsRejectedTableResponse> getMailBallotsRejectedTable(@PathVariable String fipsPrefix) {
        var dto = eavsService.getMailBallotsRejectedTable(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }

    @GetMapping("mail-ballots-rejected/chart/{fipsPrefix}")
    public ResponseEntity<MailBallotsRejectedChartResponse> getMailBallotsRejectedChart(@PathVariable String fipsPrefix) {
        var dto = eavsService.getMailBallotsRejectedChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }
}

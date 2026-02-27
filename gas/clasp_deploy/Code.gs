/* =========================================================================
   HCCS — Google Apps Script Backend
   시트: Responses (1행 = 1응답)
   ========================================================================= */

const ADMIN_PASSWORD = 'hccs2026admin';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = new Date().toISOString();
    const respondentId = Utilities.getUuid();

    // ─── Responses Sheet ───
    const headers = [
      'Timestamp', 'RespondentID',
      'Grade', 'SchoolType', 'Region', 'HasSelected',
      // Part 2 — 과목 선택
      'Q1_SelectFactor', 'Q2_CourseAvailability', 'Q3_CourseGuidance',
      'Q4_CareerLink', 'Q5_Difficulties', 'Q6_CourseImprovement',
      // Part 3 — 평가
      'Q7_AchievementUnderstanding', 'Q8_AchievementFairness',
      'Q9_FiveTierApproval', 'Q10_IncompleteSystem',
      'Q11_AssessmentProblem', 'Q12_AssessmentImprovement',
      // Part 4 — 정보·시간·기회
      'Q13_InfoAccess', 'Q14_InfoQuality', 'Q15_InfoSources',
      'Q16_TimeAutonomy', 'Q17_TimeMeaning',
      'Q18_OpportunityAccess', 'Q19_OpportunityFairness',
      'Q20_BiggestBarrier',
      // Part 5 — 웰빙
      'Q21_SelfGrowth', 'Q22_SelfDetermination', 'Q23_FlowExperience',
      'Q24_Belonging', 'Q25_PurposeMeaning',
      'Q26_OverallSatisfaction', 'Q27_FreeComment'
    ];

    let respSheet = ss.getSheetByName('Responses');
    if (!respSheet) {
      respSheet = ss.insertSheet('Responses');
      respSheet.appendRow(headers);
      respSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    const row = [
      timestamp, respondentId,
      data.grade || '', data.schoolType || '', data.region || '', data.hasSelected || '',
      data.q1_selectFactor || '', data.q2_courseAvailability || '', data.q3_courseGuidance || '',
      data.q4_careerLink || '', data.q5_difficulties || '', data.q6_courseImprovement || '',
      data.q7_achievementUnderstanding || '', data.q8_achievementFairness || '',
      data.q9_fiveTierApproval || '', data.q10_incompleteSystem || '',
      data.q11_assessmentProblem || '', data.q12_assessmentImprovement || '',
      data.q13_infoAccess || '', data.q14_infoQuality || '', data.q15_infoSources || '',
      data.q16_timeAutonomy || '', data.q17_timeMeaning || '',
      data.q18_opportunityAccess || '', data.q19_opportunityFairness || '',
      data.q20_biggestBarrier || '',
      data.q21_selfGrowth || '', data.q22_selfDetermination || '', data.q23_flowExperience || '',
      data.q24_belonging || '', data.q25_purposeMeaning || '',
      data.q26_overallSatisfaction || '', data.q27_freeComment || ''
    ];

    respSheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok', respondentId: respondentId })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const pw = e.parameter.password;
    if (pw !== ADMIN_PASSWORD) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'Unauthorized' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Responses');
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'ok', data: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok', data: rows })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

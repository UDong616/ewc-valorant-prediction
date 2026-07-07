window.EVENT_CONFIG = {
  eventName: "EWC 2026 VALORANT 승부예측",

  webAppUrl: "https://script.google.com/macros/s/AKfycbzetWeO0nh82sXIOjHJzCK0H0V7EWJsKNJcaoPjGug-yDyCJZbGyskVvGaksQ16OhLo/exec",

  // 첫 8강 경기 시작 시각 기준입니다.
  submissionDeadline: "2026-07-09T20:00:00+09:00",
  timezoneLabel: "KST",

  finalScoreOptions: ["3-0", "3-1", "3-2"],

  // 대진 미공개 상태라 팀명은 임시값입니다.
  quarterfinals: [
    {
      id: "qf1",
      title: "8강 1경기",
      startsAt: "2026-07-09T20:00:00+09:00",
      displayTime: "2026. 7. 9. 오후 8:00 KST",
      teams: ["100 Thieves", "MIBR"]
    },
    {
      id: "qf2",
      title: "8강 2경기",
      startsAt: "2026-07-09T22:45:00+09:00",
      displayTime: "2026. 7. 9. 오후 10:45 KST",
      teams: ["Team Vitality", "Nongshim RedForce"]
    },
    {
      id: "qf3",
      title: "8강 3경기",
      startsAt: "2026-07-10T20:00:00+09:00",
      displayTime: "2026. 7. 10. 오후 8:00 KST",
      teams: ["Team Heretics", "BBL Esports"]
    },
    {
      id: "qf4",
      title: "8강 4경기",
      startsAt: "2026-07-10T22:45:00+09:00",
      displayTime: "2026. 7. 10. 오후 10:45 KST",
      teams: ["Gentle Mates", "NRG"]
    }
  ],

  schedule: [
    {
      id: "qf1",
      title: "8강 1경기",
      matchup: "100 Thieves vs MIBR",
      startsAt: "2026-07-09T20:00:00+09:00",
      displayTime: "2026. 7. 9. 오후 8:00 KST"
    },
    {
      id: "qf2",
      title: "8강 2경기",
      matchup: "Team Vitality vs Nongshim RedForce",
      startsAt: "2026-07-09T22:45:00+09:00",
      displayTime: "2026. 7. 9. 오후 10:45 KST"
    },
    {
      id: "qf3",
      title: "8강 3경기",
      matchup: "Team Heretics vs BBL Esports",
      startsAt: "2026-07-10T20:00:00+09:00",
      displayTime: "2026. 7. 10. 오후 8:00 KST"
    },
    {
      id: "qf4",
      title: "8강 4경기",
      matchup: "Gentle Mates vs NRG",
      startsAt: "2026-07-10T22:45:00+09:00",
      displayTime: "2026. 7. 10. 오후 10:45 KST"
    },
    {
      id: "sf1",
      title: "4강 1경기",
      matchup: "대진 미정",
      startsAt: "2026-07-11T20:00:00+09:00",
      displayTime: "2026. 7. 11. 오후 8:00 KST"
    },
    {
      id: "sf2",
      title: "4강 2경기",
      matchup: "대진 미정",
      startsAt: "2026-07-11T22:45:00+09:00",
      displayTime: "2026. 7. 11. 오후 10:45 KST"
    },
    {
      id: "third",
      title: "3위 결정전",
      matchup: "대진 미정",
      startsAt: "2026-07-12T20:00:00+09:00",
      displayTime: "2026. 7. 12. 오후 8:00 KST"
    },
    {
      id: "final",
      title: "결승",
      matchup: "대진 미정",
      startsAt: "2026-07-12T22:45:00+09:00",
      displayTime: "2026. 7. 12. 오후 10:45 KST"
    }
  ],

  semifinalPairs: [
    { id: "sf1", title: "4강 1경기", from: ["qf1", "qf2"] },
    { id: "sf2", title: "4강 2경기", from: ["qf3", "qf4"] }
  ],

  scoring: [
    { label: "8강 승자 적중", points: 1 },
    { label: "4강 승자 적중", points: 2 },
    { label: "결승 진출팀 적중", points: 3 },
    { label: "3위 결정전 승자 적중", points: 2 },
    { label: "우승팀 적중", points: 5 },
    { label: "결승 스코어 정확히 적중", points: 2 }
  ]
};

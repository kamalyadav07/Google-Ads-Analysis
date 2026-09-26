describe('Diagnostic Heuristic Engine Rules', () => {
  test('correctly scores advertising domain when CTR is low and bounce rate is high', () => {
    const evaluateAdDomain = (ctr, bounceRate, engagementRate) => {
      let score = 0;
      if (ctr < 0.02) score += 30;
      if (bounceRate > 65) score += 35;
      if (engagementRate < 25) score += 35;
      return score;
    };

    expect(evaluateAdDomain(0.012, 78, 14)).toBe(100);
    expect(evaluateAdDomain(0.045, 35, 65)).toBe(0);
    expect(evaluateAdDomain(0.018, 50, 40)).toBe(30);
  });

  test('correctly scores form friction when form drop-off exceeds 75%', () => {
    const evaluateFormFriction = (starts, submits) => {
      if (starts < 10) return 0;
      const drop = ((starts - submits) / starts) * 100;
      return drop > 75 ? Math.round(drop) : 0;
    };

    expect(evaluateFormFriction(100, 8)).toBe(92);
    expect(evaluateFormFriction(100, 60)).toBe(0);
    expect(evaluateFormFriction(5, 0)).toBe(0); // Not enough sample size
  });

  test('prioritizes primary bottleneck with highest score', () => {
    const scores = [
      { domain: 'ADVERTISING', score: 30 },
      { domain: 'LANDING_PAGE', score: 45 },
      { domain: 'FORM_FRICTION', score: 92 },
      { domain: 'TECHNICAL', score: 10 },
      { domain: 'LEAD_QUALITY', score: 20 },
      { domain: 'SALES_CRM', score: 15 }
    ];

    scores.sort((a, b) => b.score - a.score);
    expect(scores[0].domain).toBe('FORM_FRICTION');
    expect(scores[0].score).toBe(92);
  });
});

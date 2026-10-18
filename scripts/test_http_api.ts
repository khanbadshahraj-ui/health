async function testPayAndVerify() {
  console.log('--- Testing API Endpoints via HTTP ---');
  
  // 1. Fetch invoices
  const res1 = await fetch('http://localhost:3000/api/billing/invoices');
  const d1 = await res1.json();
  const unpaid = d1.data.find((i: any) => i.status === 'UNPAID');
  console.log('Found unpaid invoice:', unpaid.invoiceNumber, 'Outstanding:', unpaid.outstandingAmount);

  // 2. Initiate Payment
  const res2 = await fetch('http://localhost:3000/api/billing/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId: unpaid.id }),
  });
  const d2 = await res2.json();
  console.log('Initiated payment result:', d2);

  if (!d2.success) {
    throw new Error('Failed to initiate payment');
  }

  // 3. Authoritative Verification
  const res3 = await fetch('http://localhost:3000/api/billing/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId: d2.data.attemptId,
      trackerToken: d2.data.trackerToken,
      simulatedStatus: 'PAID',
    }),
  });
  const d3 = await res3.json();
  console.log('Verification & Settlement result:', d3);

  // 4. Verify Invoice Balance is 0
  const res4 = await fetch(`http://localhost:3000/api/billing/invoices/${unpaid.id}`);
  const d4 = await res4.json();
  console.log('Updated invoice state in database:');
  console.log('Invoice Status:', d4.data.status);
  console.log('Paid Amount:', d4.data.paidAmount);
  console.log('Outstanding Amount:', d4.data.outstandingAmount);
  console.log('Payment Records:', d4.data.paymentRecords.length);

  // 5. Test Duplicate Verification (Idempotency)
  const res5 = await fetch('http://localhost:3000/api/billing/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId: d2.data.attemptId,
      trackerToken: d2.data.trackerToken,
      simulatedStatus: 'PAID',
    }),
  });
  const d5 = await res5.json();
  console.log('Duplicate settlement prevention (Idempotency):', d5);
}

testPayAndVerify().catch(console.error);

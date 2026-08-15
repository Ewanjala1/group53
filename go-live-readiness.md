# Northstar Support Deflection MVP — Go-Live Readiness Note

**Prepared by:** Happy Chauke  
**Sprint:** Northstar Support Deflection MVP  
**Date:** 13 August 2026

## 1. What is ready

The MVP gives customers a quick answer before they contact a support agent. It covers the three requested ticket categories:

1. **Order status** — the customer can check an order and see its delivery status.
2. **Returns and refunds** — the customer can check return guidance and receive a return reference where supported.
3. **Stock availability** — the customer can check whether a product and size are available.

## 2. What still needs work before a real public launch

This is a sprint MVP. It uses demonstration data and should not be treated as a live production support system yet.

- Replace sample orders and stock data with data from Northstar's real system.
- Connect real courier services only after approved API access is available.
- Connect refund payments only after secure payment-provider access is approved.
- Test the system with more real customer questions and edge cases.
- Add user access control and secure handling of customer information before public launch.


## 3. Acceptance check before handover

- [ ] The customer portal opens successfully.
- [ ] Order-status questions return an answer.
- [ ] Returns/refunds questions return an answer.
- [ ] Stock-availability questions return an answer.
- [ ] The test suite has been run and its real result is recorded.
- [ ] Known limitations have been shared with the receiving team.
- [ ] No secret keys or private customer data are committed to the repository.

## 4. Evidence links

Add real evidence after this document is committed.

- Repository: https://github.com/Ewanjala1/group53
- Live demo: https://group53-nine.vercel.app/


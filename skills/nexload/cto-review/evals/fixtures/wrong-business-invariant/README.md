# @nexload-sdk/payment-engine

Payment verification and refund processing service.

Explicit business invariants required:
- Payment cannot be verified twice.
- Credit cannot become negative without explicit overdraft policy.
- Completed/shipped orders cannot regress backward.

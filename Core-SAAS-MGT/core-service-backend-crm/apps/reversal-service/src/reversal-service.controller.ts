import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReversalServiceService } from './reversal-service.service';
import { CreateReversalDto } from './dto/create-reversal.dto';
import { Permissions, PermissionsGuard } from '@app/common';

@ApiTags('Reversals')
@ApiBearerAuth('JWT-auth')
@Controller('reversal')
@UseGuards(PermissionsGuard)
export class ReversalServiceController {
  constructor(
    private readonly reversalServiceService: ReversalServiceService,
  ) { }

  @Post()
  @Permissions('reversal.create')
  @ApiOperation({
    summary: 'Create a reversal',
    description: `Reverse a completed transaction — full or partial.

**Reversal types:**
- \`FULL_REVERSAL\` — Reverses the entire original amount (mirror image posting)
- \`PARTIAL_REVERSAL\` — Reverses a portion of the original amount
- \`CHARGEBACK\` — Customer-initiated dispute reversal

**GL flow:** The reversal inverts all original ledger entries (debits become credits, credits become debits) proportionally.

**Auto-execution:** Reversals ≤ $100,000 execute immediately. Larger amounts require approval.`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['originalTransactionId', 'reason', 'tenantId', 'requestedBy'],
      properties: {
        originalTransactionId: { type: 'string', example: 'journal-uuid', description: 'UUID of the original journal_entry to reverse' },
        transactionId:         { type: 'string', example: 'journal-uuid', description: 'Alias for originalTransactionId' },
        type: {
          type: 'string',
          enum: ['FULL_REVERSAL', 'PARTIAL_REVERSAL', 'CHARGEBACK'],
          example: 'FULL_REVERSAL',
          default: 'FULL_REVERSAL',
        },
        amount:            { type: 'number', example: 42.50, description: 'For PARTIAL_REVERSAL only. Omit for FULL_REVERSAL.' },
        reason:            { type: 'string', example: 'DUPLICATE_PAYMENT', description: 'Reversal reason code' },
        reasonDescription: { type: 'string', example: 'Customer was charged twice for the same trip' },
        tenantId:          { type: 'string', example: 'root-admin' },
        requestedBy:       { type: 'string', example: 'account-officer-uuid', description: 'User UUID requesting the reversal' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Reversal created and executed (or queued for approval)' })
  @ApiResponse({ status: 400, description: 'Invalid input or amount exceeds original transaction' })
  @ApiResponse({ status: 404, description: 'Original transaction not found in ledger' })
  async createReversal(@Body() dto: CreateReversalDto) {
    return this.reversalServiceService.createReversal(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reversal by ID', description: 'Retrieves the details of a specific reversal record.' })
  @ApiParam({ name: 'id', required: true, description: 'Reversal record ID' })
  @ApiResponse({ status: 200, description: 'Reversal returned successfully' })
  @ApiResponse({ status: 404, description: 'Reversal not found' })
  async getReversal(@Param('id') id: string) {
    return this.reversalServiceService.getReversal(id);
  }
}

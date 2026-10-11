/**
 * Temporal Client — connects to the Temporal server and provides
 * a shared client instance for starting/querying workflows.
 */
import { Connection, Client, WorkflowHandle } from '@temporalio/client';

let temporalClient: Client | null = null;

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
export const TASK_QUEUE = 'os-task-queue';

export async function getTemporalClient(): Promise<Client> {
  if (temporalClient) return temporalClient;

  const connectWithTimeout = async () => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Temporal connection timeout')), 3000)
    );
    const connect = Connection.connect({ address: TEMPORAL_ADDRESS });
    return Promise.race([connect, timeout]);
  };
  const connection = await connectWithTimeout();
  temporalClient = new Client({ connection });

  console.log(`[Temporal] Connected to ${TEMPORAL_ADDRESS}`);
  return temporalClient;
}

export async function startWorkflow<T extends object>(
  workflowFn: string,
  args: any[],
  workflowId: string
): Promise<WorkflowHandle<any>> {
  const client = await getTemporalClient();
  return client.workflow.start(workflowFn, {
    taskQueue: TASK_QUEUE,
    workflowId,
    args,
  });
}

export async function getWorkflowStatus(workflowId: string): Promise<Record<string, any>> {
  const client = await getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  const description = await handle.describe();
  return {
    workflowId: description.workflowId,
    status: description.status.name,
    startTime: description.startTime,
    closeTime: description.closeTime,
    type: description.type,
  };
}

export async function sendSignal(
  workflowId: string,
  signalName: string,
  payload: any
): Promise<void> {
  const client = await getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  await handle.signal(signalName, payload);
  console.log(`[Temporal] Sent signal '${signalName}' to workflow '${workflowId}'`);
}

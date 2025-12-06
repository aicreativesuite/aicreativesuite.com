
import React, { useState } from 'react';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

const TECHNICAL_SPECS = `
# E. TECHNICAL SYSTEM DESIGN — AI CREATIVE SUITE

## 1. SYSTEM OVERVIEW

\`\`\`
+-----------------------------+
| User Interface |
| (Web, Desktop, Mobile) |
+-----------------------------+
            |
            v
+-----------------------------+
| API Gateway Layer |
| REST + GraphQL + WebSocket |
+-----------------------------+
            |
            v
+-----------------------------+
| Orchestration Layer |
| - Agent Coordinator |
| - Workflow Manager |
| - Task Queue / Scheduler |
+-----------------------------+
            |
            v
+-----------------------------+
| AI Inference / Model Layer |
| - Language Models |
| - Vision Models |
| - Audio Models |
| - Video Models |
| - 3D / Graphics Models |
+-----------------------------+
            |
            v
+-----------------------------+
| GPU Cluster / Compute |
| - On-demand VM / Containers |
| - Multi-GPU nodes |
| - Kubernetes / Slurm |
+-----------------------------+
            |
            v
+-----------------------------+
| Storage / Data Layer |
| - Object Storage (S3/GCS) |
| - Database (Postgres/NoSQL)|
| - Cache (Redis/MemoryDB) |
| - Artifact / Asset Store |
+-----------------------------+
\`\`\`

## 2. API LAYER

### 2.1 API Types
*   **REST API**: main interface for web/mobile clients
*   **GraphQL API**: flexible queries for project and asset metadata
*   **WebSocket / SSE**: live updates (progress, agent events)

### 2.2 Sample REST Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| \`/api/v1/agents/run\` | POST | Launch an agent run |
| \`/api/v1/runs/{id}\` | GET | Query run status |
| \`/api/v1/runs/{id}/artifacts\` | GET | List generated outputs |
| \`/api/v1/runs/{id}/approve\` | POST | Human review approval |
| \`/api/v1/projects\` | POST | Create new project |
| \`/api/v1/assets\` | POST | Upload reference images / assets |
| \`/api/v1/metrics\` | GET | System & job metrics |

## 3. BACKEND ARCHITECTURE

### 3.1 Microservice Breakdown
*   **API Service**: authentication, input validation, request routing
*   **Orchestration Service**: agent scheduling, DAG execution, retry/fail logic
*   **Task Queue Service**: Celery / RabbitMQ / Kafka for parallelized agent execution
*   **Agent Service**: containerized AI models (Python / PyTorch / TensorRT)
*   **Quality Service**: automated checks, validation, continuity
*   **Human Review Service**: workflow queue for approvals
*   **Asset Service**: asset storage, versioning, metadata

### 3.2 Workflow Orchestration
*   Agents defined as nodes in a DAG.
*   Coordinator schedules nodes, handles retries, ensures idempotency.
*   Parallelizable agents (e.g., scene generation) execute across GPU cluster.
*   Event-driven: \`scene.completed\`, \`quality.failed\`, \`revision.requested\`.
*   Persistent run-state: Redis (ephemeral) + Postgres (snapshot).

## 4. AI INFERENCE LAYER

### 4.1 Model Types
*   **Vision Models**: Text-to-image (Stable Diffusion 2.x / Midjourney-class), Inpainting / Outpainting, Super-resolution, Text overlay removal
*   **Language Models**: GPT-5-mini / Claude-class, Story/script generation, Prompt expansion
*   **Audio Models**: Text-to-speech / Voice cloning, Music generation, Foley / SFX AI
*   **Video Models**: Text-to-video, Video editing / motion interpolation, Lip-sync / face animation
*   **3D / Graphics Models**: Mesh generation, Material / texture AI, Camera & lighting AI

### 4.2 Inference Pipeline
1.  Input preprocessing: normalize text, images, or audio
2.  Prompt compiler: generate structured multimodal prompts
3.  Model selection: choose optimized model for task
4.  GPU scheduling: assign job to available GPU node
5.  Inference execution: PyTorch / TensorRT / ONNX runtime
6.  Post-processing: denoising, upscaling, compositing
7.  Artifact storage: save outputs to S3 / object store

## 5. GPU CLUSTER / INFRASTRUCTURE

### 5.1 Compute
*   Kubernetes cluster managing GPU nodes
*   Multi-GPU nodes (NVIDIA A100 / H100)
*   Containerized inference (Docker / Singularity)
*   Auto-scaling based on queued jobs
*   Preemptible spot instances for cost efficiency

### 5.2 Scheduler
*   Slurm / Ray / KubeFlow style orchestration
*   DAG-aware, dependency tracking
*   Supports parallelization for fan-out tasks (e.g., scene generation)
*   Supports iterative refinement loops

## 6. STORAGE & DATA MANAGEMENT

### 6.1 Storage Types
*   **Object storage**: S3 / GCS / MinIO for images, video, audio
*   **Relational DB**: PostgreSQL for projects, runs, metadata
*   **NoSQL DB**: MongoDB / DynamoDB for rapid asset metadata access
*   **Cache**: Redis / MemoryDB for ephemeral state, run queue

### 6.2 Data Layer Features
*   Versioned artifacts
*   Metadata indexing for search
*   StyleDNA / model parameters stored per asset
*   Immutable logs for reproducibility

## 7. SECURITY & AUTH
*   OAuth 2.0 / JWT authentication
*   RBAC: agent runs, approvals, publish permissions
*   HTTPS / TLS encryption for transport
*   S3 buckets with IAM policies
*   Audit logs for all agent actions and user approvals
*   Optional sandboxing for third-party agent plugins

## 8. MONITORING & OBSERVABILITY
*   **Metrics**: GPU utilization, task latency, job cost estimate
*   **Logs**: centralized (ELK / Grafana)
*   **Live DAG visualization**: agent status & task progress
*   **Quality score dashboards**: (image/video/audio)
*   **Alerts**: failed runs, human review pending, GPU errors

## 9. HIGH-LEVEL WORKFLOW SUMMARY

\`\`\`
User → API Gateway → Coordinator → DAG Scheduler
             ↘ Agent Bus → Agents (Image, Video, Audio, Script, 3D)
                       ↘ GPU Nodes → Inference → Artifact Storage
             ↘ Quality Agent → Human Review → Approval → Publish Agent
\`\`\`

*   Agents can run parallel, iterative, or linear workflows
*   Human review checkpoints at high-risk stages
*   Coordinator ensures cost, SLA, and reproducibility

## 10. SCALABILITY & OPTIMIZATION
*   Horizontal GPU scaling for heavy workloads (e.g., full-length films)
*   Caching intermediate outputs to avoid recomputation
*   Batch inference for images/audio frames
*   Auto-prioritization based on cost & SLA
*   Pre-warming models to reduce cold start latency
*   Multi-tenant isolation for enterprise deployments
`;

interface LayerCardProps {
    title: string;
    children?: React.ReactNode;
    color?: string;
}

const LayerCard: React.FC<LayerCardProps> = ({ title, children, color = "border-slate-700" }) => (
    <div className={`bg-slate-900/50 rounded-xl border ${color} p-6 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">{title}</h3>
        <div className="space-y-2 relative z-10">
            {children}
        </div>
    </div>
);

const Item = ({ label, subItems }: { label: string, subItems?: string[] }) => (
    <div className="mb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            {label}
        </div>
        {subItems && (
            <div className="pl-4 text-[10px] text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {subItems.map((s, i) => <div key={i} className="flex items-center gap-1 before:content-['-'] before:mr-1">{s}</div>)}
            </div>
        )}
    </div>
);

const SystemArchitecture: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'visual' | 'specs'>('visual');

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-center mb-8">
                <div className="text-center w-full">
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">System Architecture</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-6">Full stack visualization of the AI Creative Suite infrastructure.</p>
                    
                    <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button 
                            onClick={() => setActiveTab('visual')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'visual' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Visual Stack
                        </button>
                        <button 
                            onClick={() => setActiveTab('specs')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'specs' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Technical Specs
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
                {activeTab === 'visual' ? (
                    <div className="space-y-8 animate-fadeIn">
                        {/* 1. Foundation Layer */}
                        <div className="max-w-6xl mx-auto w-full">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Foundation Layer (Multi-Model Intelligence Core)</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <LayerCard title="Vision Models" color="border-purple-500/30 bg-purple-900/10">
                                    <Item label="Diffusion Engine" subItems={['Next-Gen SD']} />
                                    <Item label="Photoreal Engine" subItems={['Midjourney-class']} />
                                    <Item label="Text-in-Image" subItems={['Idiogram-class']} />
                                    <Item label="Editing Models" subItems={['Inpainting', 'Outpainting', 'Relighting']} />
                                </LayerCard>
                                <LayerCard title="Language Models" color="border-blue-500/30 bg-blue-900/10">
                                    <Item label="Writing Model" subItems={['ChatGPT-class']} />
                                    <Item label="Research" subItems={['Claude-class']} />
                                    <Item label="Brand Voice" subItems={['Jasper-class']} />
                                </LayerCard>
                                <LayerCard title="Audio Models" color="border-amber-500/30 bg-amber-900/10">
                                    <Item label="Text-to-Speech" subItems={['ElevenLabs-class']} />
                                    <Item label="Voice Cloning" />
                                    <Item label="Text-to-Music" subItems={['Suno-class']} />
                                    <Item label="Sound Design" />
                                </LayerCard>
                                <LayerCard title="Video Models" color="border-red-500/30 bg-red-900/10">
                                    <Item label="Text → Video" subItems={['Runway Gen-3-class']} />
                                    <Item label="Video Editing" subItems={['Masking', 'Removal']} />
                                    <Item label="Lip Sync" />
                                    <Item label="Motion Capture" />
                                </LayerCard>
                            </div>
                        </div>

                        {/* 2. Orchestration & Engines */}
                        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Orchestration Layer</div>
                                <LayerCard title="Agentic Core" color="border-cyan-500/30 bg-cyan-900/10">
                                    <Item label="Workflow Engine" subItems={['Multi-step pipelines', 'Auto revisions (A/B)', 'Batch generation']} />
                                    <Item label="Autonomous Agents" subItems={['Campaign Agent', 'Video Agent', 'Graphic Design Agent', 'Writing Agent', 'Brand Manager']} />
                                    <Item label="Prompt Compiler" subItems={['Multimodal conversion', 'Style consistency', 'Auto-fix weak prompts']} />
                                    <Item label="Knowledge Graph" subItems={['Brand assets', 'User styles', 'Project history']} />
                                </LayerCard>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Creative Engines</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <LayerCard title="Image Studio">
                                        <Item label="Generators" subItems={['Text/Image → Image', 'Editing', 'Posters/Logos']} />
                                    </LayerCard>
                                    <LayerCard title="Video Studio">
                                        <Item label="Generators" subItems={['Script → Video', 'Storyboard', 'Face/Lip Sync', 'Full Film']} />
                                    </LayerCard>
                                    <LayerCard title="Audio Studio">
                                        <Item label="Generators" subItems={['Voiceovers', 'Cloning', 'Music', 'SFX']} />
                                    </LayerCard>
                                    <LayerCard title="Writing Studio">
                                        <Item label="Generators" subItems={['Blog', 'Script', 'Story', 'SEO', 'Grammar']} />
                                    </LayerCard>
                                </div>
                            </div>
                        </div>

                        {/* 3. Application & Delivery */}
                        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Application Layer</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <LayerCard title="User Tools">
                                        <Item label="Design Suite" subItems={['Drag-and-drop', 'Auto-layout', 'Brand kit']} />
                                        <Item label="Studio Editor" subItems={['Timeline', 'Smart layers', 'Auto captions']} />
                                    </LayerCard>
                                    <LayerCard title="Script & Dev">
                                        <Item label="Content Lab" subItems={['Brand memory', 'Long-form', 'Research']} />
                                        <Item label="Developer" subItems={['API Access', 'Webhooks', 'Plugins']} />
                                    </LayerCard>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Delivery & Security</div>
                                <LayerCard title="Output & Ops" color="border-green-500/30 bg-green-900/10">
                                    <Item label="Exports" subItems={['PNG/SVG', 'MP4/MOV', 'WAV/MP3', 'DOCX/PDF']} />
                                    <Item label="Integrations" subItems={['Adobe', 'Figma', 'YouTube', 'GitHub']} />
                                    <Item label="Security" subItems={['Rights Mgmt', 'Deepfake Protection', 'RBAC/SSO']} />
                                </LayerCard>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto bg-slate-900/50 p-8 rounded-xl border border-slate-700 prose prose-invert prose-sm max-w-none animate-fadeIn">
                        <div dangerouslySetInnerHTML={{ __html: md.render(TECHNICAL_SPECS) }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemArchitecture;

import { useEffect, useId, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  LayoutGroup,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import './App.css'

const sectionMeta = [
  { id: 'overview', label: '1. Overview' },
  { id: 'communication', label: '2. Communication' },
  { id: 'ecosystem', label: '3. Ecosystem' },
  { id: 'docker', label: '4. Docker' },
  { id: 'demo', label: '5. Demo' },
]

const ecosystemPractices = [
  {
    id: '01',
    title: 'Gateway First',
    text: 'Use API Gateway as the single entry point for routing, throttling, and policy enforcement.',
  },
  {
    id: '02',
    title: 'Bounded Services',
    text: 'Split services by domain capability so each team can ship independently without coupling.',
  },
  {
    id: '03',
    title: 'State Strategy',
    text: 'Choose stateless services for elasticity and stateful services only when locality is required.',
  },
  {
    id: '04',
    title: 'Platform Support',
    text: 'Service Fabric or Kubernetes helps package, observe, and scale microservice workloads.',
  },
]

const conclusionTags = ['Scalability', 'Reliability', 'Gateway', 'Async Events', 'Containers']

const benefitItems = [
  {
    title: 'Scalability',
    subtitle: 'Scale hotspots only',
    color: '#f4bf2a',
    icon: 'scalability',
    definition:
      'Scale only busy services like search or checkout without scaling the whole system.',
  },
  {
    title: 'Technology Adoption',
    subtitle: 'Right stack per service',
    color: '#ff5a5f',
    icon: 'technology',
    definition:
      'Teams can adopt language, storage, or framework choices that fit each business domain.',
  },
  {
    title: 'Deployment',
    subtitle: 'Independent release',
    color: '#6bb4e8',
    icon: 'deployment',
    definition:
      'Deploy one service quickly without waiting for a full-system coordinated release window.',
  },
  {
    title: 'Business',
    subtitle: 'Capability ownership',
    color: '#3dbd67',
    icon: 'business',
    definition:
      'Align service boundaries with business capabilities so teams move faster with lower friction.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function CommunicationNode({ label, type = 'service', nodeRef }) {
  return (
    <motion.div
      ref={nodeRef}
      className={`comm-node comm-node-${type}`}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.35 }}
    >
      <span>{label}</span>
    </motion.div>
  )
}

CommunicationNode.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  nodeRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
}

function CommunicationArrow({ label = '', dashed = false, tone = 'blue', direction = 'right', labelPosition = 'top' }) {
  const markerId = useId().replace(/:/g, '')
  const color = tone === 'green' ? '#32b276' : '#56a4df'

  return (
    <div
      className={`comm-arrow ${dashed ? 'is-dashed' : ''} ${direction === 'left' ? 'is-left' : ''} ${labelPosition === 'bottom' ? 'is-label-bottom' : ''} tone-${tone}`}
    >
      <svg className="comm-arrow-svg" viewBox="0 0 60 10" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id={`m-${markerId}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={color} />
          </marker>
        </defs>
        <line
          x1={direction === 'left' ? 58 : 2}
          y1="5"
          x2={direction === 'left' ? 2 : 58}
          y2="5"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '4 3' : undefined}
          markerEnd={`url(#m-${markerId})`}
        />
      </svg>
      {label ? <span>{label}</span> : null}
    </div>
  )
}

CommunicationArrow.propTypes = {
  label: PropTypes.string,
  dashed: PropTypes.bool,
  tone: PropTypes.string,
  direction: PropTypes.oneOf(['left', 'right']),
  labelPosition: PropTypes.oneOf(['top', 'bottom']),
}

function CommunicationDualArrow({ topLabel, bottomLabel, tone = 'blue' }) {
  return (
    <div className={`comm-dual tone-${tone}`}>
      <CommunicationArrow label={topLabel} tone={tone} direction="right" />
      <CommunicationArrow label={bottomLabel} tone={tone} direction="left" labelPosition="bottom" />
    </div>
  )
}

CommunicationDualArrow.propTypes = {
  topLabel: PropTypes.string.isRequired,
  bottomLabel: PropTypes.string.isRequired,
  tone: PropTypes.string,
}

function CommunicationFlowLane({ title, description, variant }) {
  const stageRef = useRef(null)
  const basketRef = useRef(null)
  const catalogRef = useRef(null)
  const [laneWidth, setLaneWidth] = useState(760)
  const [laneAnchors, setLaneAnchors] = useState({ basket: 200, catalog: 453 })

  useEffect(() => {
    if (variant !== 'event-bus' && variant !== 'polling') {
      return undefined
    }

    const updateAnchors = () => {
      const stageEl = stageRef.current
      const basketEl = basketRef.current
      const catalogEl = catalogRef.current

      if (!stageEl || !basketEl || !catalogEl) {
        return
      }

      const stageRect = stageEl.getBoundingClientRect()
      const basketRect = basketEl.getBoundingClientRect()
      const catalogRect = catalogEl.getBoundingClientRect()
      const stageWidth = Math.round(stageRect.width)

      const basketCenter = Math.round(basketRect.left - stageRect.left + basketRect.width / 2)
      const catalogCenter = Math.round(catalogRect.left - stageRect.left + catalogRect.width / 2)

      setLaneWidth((prev) => (prev === stageWidth ? prev : stageWidth))

      setLaneAnchors((prev) => {
        if (prev.basket === basketCenter && prev.catalog === catalogCenter) {
          return prev
        }

        return {
          basket: basketCenter,
          catalog: catalogCenter,
        }
      })
    }

    updateAnchors()

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateAnchors) : null
    if (observer) {
      if (stageRef.current) observer.observe(stageRef.current)
      if (basketRef.current) observer.observe(basketRef.current)
      if (catalogRef.current) observer.observe(catalogRef.current)
    }

    window.addEventListener('resize', updateAnchors)

    return () => {
      window.removeEventListener('resize', updateAnchors)
      observer?.disconnect()
    }
  }, [variant])

  const visualAnchorShift = 0
  const basketArrowX = laneAnchors.basket + visualAnchorShift
  const catalogArrowX = laneAnchors.catalog + visualAnchorShift
  const basketOpticalShift = -55
  const catalogOpticalShift = 6
  const basketTargetX = basketArrowX + basketOpticalShift
  const catalogTargetX = catalogArrowX + catalogOpticalShift
  const eventTextX = (basketTargetX + catalogTargetX) / 2
  const pollingRightOuterX = catalogTargetX + 10
  const pollingLeftInnerX = basketTargetX + 10

  return (
    <motion.div
      className="flow-lane-v2"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flow-lane-left">
        <span className="flow-lane-badge-v2">{title}</span>
        <p className="flow-lane-description">{description}</p>
      </div>
      <div className="flow-lane-content-v2 comm-content">
        {variant === 'sync' ? (
          <>
            <div className="comm-row">
              <CommunicationNode label="Client" type="client" />
              <CommunicationDualArrow topLabel="Http sync. request" bottomLabel="Http sync. response" />
              <CommunicationNode label="Basket" type="basket" />
              <CommunicationDualArrow topLabel="Http sync. request" bottomLabel="Http sync. response" />
              <CommunicationNode label="Ordering" type="ordering" />
              <CommunicationDualArrow topLabel="Http sync. request" bottomLabel="Http sync. response" />
              <CommunicationNode label="Catalog" type="catalog" />
              <CommunicationDualArrow topLabel="Http sync. request" bottomLabel="Http sync. response" />
              <CommunicationNode label="Other" type="other" />
            </div>
          </>
        ) : null}

        {variant === 'event-bus' ? (
          <div className="comm-event-stage" ref={stageRef}>
            <div className="comm-row comm-event-main-row">
              <CommunicationNode label="Client" type="client" />
              <CommunicationDualArrow topLabel="Http sync. request" bottomLabel="Http sync. response" />
              <CommunicationNode label="Basket" type="basket" nodeRef={basketRef} />
              <CommunicationArrow dashed={true} tone="green" />
              <CommunicationNode label="Ordering" type="ordering" />
              <CommunicationArrow dashed={true} tone="green" direction="left" />
              <CommunicationNode label="Catalog" type="catalog" nodeRef={catalogRef} />
              <CommunicationArrow dashed={true} tone="green" direction="left" />
              <CommunicationNode label="Other" type="other" />
            </div>
            <svg className="comm-event-orth" viewBox={`0 0 ${laneWidth} 68`} aria-hidden="true">
              <polyline
                points={`${catalogTargetX},10 ${catalogTargetX},40 ${basketTargetX},40 ${basketTargetX},24`}
                fill="none"
                stroke="#32b276"
                strokeWidth="2"
              />
              <polygon
                points={`${basketTargetX},24 ${basketTargetX + 4},32 ${basketTargetX - 4},32`}
                fill="#32b276"
              />
              <text x={eventTextX} y="50" textAnchor="middle">Catalog to Basket</text>
            </svg>
          </div>
        ) : null}

        {variant === 'polling' ? (
          <div className="comm-polling-stage" ref={stageRef}>
            <div className="comm-row comm-polling-main-row">
              <CommunicationNode label="Client" type="client" />
              <CommunicationDualArrow topLabel="Http sync. request" bottomLabel="Http sync. response" />
              <CommunicationNode label="Basket" type="basket" nodeRef={basketRef} />
              <CommunicationDualArrow topLabel="Http Polling" bottomLabel="Http Polling" tone="green" />
              <CommunicationNode label="Ordering" type="ordering" />
              <CommunicationDualArrow topLabel="Http Polling" bottomLabel="Http Polling" tone="green" />
              <CommunicationNode label="Catalog" type="catalog" nodeRef={catalogRef} />
              <CommunicationDualArrow topLabel="Http Polling" bottomLabel="Http Polling" tone="green" />
              <CommunicationNode label="Other" type="other" />
            </div>
            <svg className="comm-polling-orth" viewBox={`0 0 ${laneWidth} 84`} aria-hidden="true">
              <polyline
                points={`${pollingLeftInnerX},24 ${pollingLeftInnerX},46 ${catalogTargetX},46 ${catalogTargetX},24`}
                fill="none"
                stroke="#32b276"
                strokeWidth="2"
              />
              <polygon
                points={`${catalogTargetX},24 ${catalogTargetX + 4},32 ${catalogTargetX - 4},32`}
                fill="#32b276"
              />

              <polyline
                points={`${pollingRightOuterX},24 ${pollingRightOuterX},62 ${basketTargetX},62 ${basketTargetX},26`}
                fill="none"
                stroke="#32b276"
                strokeWidth="2"
              />
              <polygon
                points={`${basketTargetX},26 ${basketTargetX + 4},34 ${basketTargetX - 4},34`}
                fill="#32b276"
              />
            </svg>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

CommunicationFlowLane.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['sync', 'event-bus', 'polling']).isRequired,
}

function BenefitHexIcon({ type }) {
  if (type === 'scalability') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 17h3v-4H5zM10 17h3v-7h-3zM15 17h4v-10h-4z" fill="currentColor" opacity="0.45" />
        <path d="M5 13l4-3 3 2 6-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 6h3v3" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'technology') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="8" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.9" />
        <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M6 18l1.4-1.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'deployment') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v11" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M8.5 11.5L12 15l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 18h14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <rect x="6" y="18" width="12" height="2" rx="1" fill="currentColor" opacity="0.4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="8" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M9 8V6.8A1.8 1.8 0 0110.8 5h2.4A1.8 1.8 0 0115 6.8V8" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />
    </svg>
  )
}

BenefitHexIcon.propTypes = {
  type: PropTypes.string.isRequired,
}

function GatewayRoutingDiagram() {
  return (
    <div className="gateway-svg-wrap" role="img" aria-label="API gateway routing diagram">
      <svg viewBox="0 0 760 600" className="gateway-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="g-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#666" />
          </marker>
        </defs>

        <rect x="150" y="32" width="460" height="96" fill="none" stroke="#8f8f8f" strokeDasharray="5 4" />
        <text x="380" y="42" textAnchor="middle" className="g-label">Client</text>

        <rect x="175" y="52" width="100" height="44" className="g-box" />
        <text x="225" y="79" textAnchor="middle" className="g-text">Web</text>

        <rect x="330" y="52" width="100" height="44" className="g-box" />
        <text x="380" y="79" textAnchor="middle" className="g-text">Mobile</text>

        <rect x="485" y="52" width="100" height="44" className="g-box" />
        <text x="535" y="79" textAnchor="middle" className="g-text">Others</text>

        <rect x="230" y="188" width="300" height="64" className="g-box" />
        <text x="380" y="214" textAnchor="middle" className="g-text">Providers</text>
        <text x="380" y="234" textAnchor="middle" className="g-text">(Example: Identity provider)</text>

        <rect x="255" y="292" width="250" height="64" className="g-box" />
        <text x="380" y="318" textAnchor="middle" className="g-text">API Gateway</text>
        <text x="380" y="338" textAnchor="middle" className="g-text">(Azure API Management)</text>

        <rect x="160" y="406" width="440" height="78" fill="none" stroke="#8f8f8f" strokeDasharray="5 4" />
        <text x="380" y="420" textAnchor="middle" className="g-label">Microservices</text>

        <rect x="185" y="430" width="105" height="44" className="g-box" />
        <text x="237" y="457" textAnchor="middle" className="g-text">Service 1</text>

        <rect x="328" y="430" width="105" height="44" className="g-box" />
        <text x="380" y="457" textAnchor="middle" className="g-text">Service 2</text>

        <rect x="470" y="430" width="105" height="44" className="g-box" />
        <text x="522" y="457" textAnchor="middle" className="g-text">Service 3</text>

        <rect x="268" y="520" width="224" height="44" className="g-box" />
        <text x="380" y="547" textAnchor="middle" className="g-text">Other Facilitate Utilities</text>

        <path d="M 205 128 L 205 330 L 255 330" fill="none" stroke="#666" strokeWidth="1.8" markerEnd="url(#g-arrow)" />
        <path d="M 380 128 Q 380 160 380 188" fill="none" stroke="#666" strokeWidth="1.8" markerEnd="url(#g-arrow)" />
        <path d="M 380 252 Q 380 270 380 292" fill="none" stroke="#666" strokeWidth="1.8" markerEnd="url(#g-arrow)" />

        <line x1="237" y1="370" x2="522" y2="370" stroke="#666" strokeWidth="1.8" />
        <path d="M 237 370 L 237 406" fill="none" stroke="#666" strokeWidth="1.8" markerEnd="url(#g-arrow)" />
        <path d="M 380 357 L 380 406" fill="none" stroke="#666" strokeWidth="1.8" markerEnd="url(#g-arrow)" />
        <path d="M 522 370 L 522 406" fill="none" stroke="#666" strokeWidth="1.8" markerEnd="url(#g-arrow)" />

        <path d="M 380 474 Q 380 495 380 520" fill="none" stroke="#666" strokeWidth="1.8" markerEnd="url(#g-arrow)" />
      </svg>
    </div>
  )
}

function SequenceArchitectureDiagram() {
  return (
    <div className="sequence-arch-wrap" role="img" aria-label="Client to API gateway and microservices architecture diagram">
      <svg viewBox="0 0 1200 320" className="sequence-arch-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="seq-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#616161" />
          </marker>

          <symbol id="seq-container-icon" viewBox="0 0 56 44">
            <rect x="1.5" y="1.5" width="53" height="30" rx="2" fill="#0f67c2" />
            <rect x="1.5" y="1.5" width="53" height="30" rx="2" fill="none" stroke="#8256ca" strokeWidth="2.4" />
            <polygon points="22,6 34,6 40,16 34,26 22,26 16,16" fill="none" stroke="#8ad2ff" strokeWidth="1.8" />
            <text x="28" y="40" textAnchor="middle" fill="#777" fontSize="8" fontFamily="Arial, sans-serif">container</text>
          </symbol>

          <symbol id="seq-data-icon" viewBox="0 0 72 52">
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="#1b80d6" />
            <rect x="9" y="10" width="30" height="24" fill="#1b80d6" />
            <ellipse cx="24" cy="34" rx="15" ry="6" fill="#1b80d6" />
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="none" stroke="#c9e7ff" strokeWidth="1.4" />
          </symbol>

          <symbol id="seq-redis-icon" viewBox="0 0 72 52">
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="#1b80d6" />
            <rect x="9" y="10" width="30" height="24" fill="#1b80d6" />
            <ellipse cx="24" cy="34" rx="15" ry="6" fill="#1b80d6" />
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="none" stroke="#c9e7ff" strokeWidth="1.4" />
            <path d="M49 19 L59 19 L54 28 L62 28 L50 42 L54 32 L46 32 Z" fill="#ffffff" />
          </symbol>
        </defs>

        <rect x="285" y="24" width="875" height="252" rx="8" className="seq-backend-zone" />
        <text x="314" y="58" className="seq-backend-title">Back end</text>

        <rect x="24" y="70" width="230" height="170" rx="24" className="seq-client-zone" />
        <text x="139" y="90" textAnchor="middle" className="seq-zone-title">Client mobile app</text>
        <rect x="113" y="112" width="52" height="96" rx="8" className="seq-phone" />
        <rect x="118" y="118" width="42" height="76" rx="4" className="seq-phone-screen" />
        <circle cx="139" cy="201" r="4" className="seq-phone-dot" />

        <rect x="380" y="124" width="220" height="78" rx="14" className="seq-service-zone" />
        <text x="402" y="142" className="seq-service-title">API Gateway</text>
        <use href="#seq-container-icon" x="402" y="148" width="58" height="45" />
        <text x="470" y="163" className="seq-small-label">ASP.NET Core</text>
        <text x="470" y="176" className="seq-small-label">Web API</text>

        <rect x="735" y="42" width="300" height="92" rx="14" className="seq-service-zone" />
        <text x="756" y="61" className="seq-service-title">Catalog microservice</text>
        <text x="756" y="76" className="seq-small-label">Web API</text>
        <use href="#seq-container-icon" x="754" y="82" width="58" height="45" />
        <use href="#seq-data-icon" x="832" y="61" width="100" height="80" />
        <line x1="844" y1="97" x2="812" y2="97" className="seq-link" markerEnd="url(#seq-arrow)" />
        <text x="920" y="96" className="seq-db-label">SQL Server</text>
        <text x="920" y="109" className="seq-small-label">container</text>

        <rect x="735" y="150" width="300" height="92" rx="14" className="seq-service-zone" />
        <text x="756" y="169" className="seq-service-title">Basket microservice</text>
        <text x="756" y="184" className="seq-small-label">Web API</text>
        <use href="#seq-container-icon" x="754" y="189" width="58" height="45" />
        <use href="#seq-redis-icon" x="832" y="169" width="100" height="80" />
        <line x1="844" y1="205" x2="812" y2="205" className="seq-link" markerEnd="url(#seq-arrow)" />
        <text x="908" y="210" className="seq-redis-label">Redis cache</text>

        <line x1="254" y1="164" x2="380" y2="164" className="seq-link" markerEnd="url(#seq-arrow)" />
        <text x="320" y="146" className="seq-http-label">HTTP</text>
        <text x="296" y="182" className="seq-http-sub">request/response</text>

        <line x1="600" y1="164" x2="735" y2="89" className="seq-link" markerEnd="url(#seq-arrow)" />
        <line x1="600" y1="164" x2="735" y2="198" className="seq-link" markerEnd="url(#seq-arrow)" />
        <text x="630" y="160" className="seq-http-label2">HTTP request/response</text>
      </svg>
    </div>
  )
}

function SignalRCommunicationDiagram() {
  return (
    <div className="signalr-arch-wrap" role="img" aria-label="Two SPA clients communicating with backend SignalR service hub">
      <svg viewBox="0 0 980 350" className="signalr-arch-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="signalr-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="#666" />
          </marker>
        </defs>

        <rect x="470" y="20" width="480" height="300" rx="10" className="signalr-backend-zone" />
        <text x="500" y="52" className="signalr-backend-title">Back end</text>

        <rect x="32" y="28" width="370" height="136" rx="16" className="signalr-client-zone" />
        <text x="58" y="52" className="signalr-client-title">Client-1 WebApp SPA</text>
        <rect x="165" y="60" width="98" height="84" rx="6" className="signalr-screen" />
        <rect x="170" y="66" width="88" height="14" className="signalr-screen-bar" />
        <rect x="170" y="86" width="52" height="50" className="signalr-screen-pane" />
        <circle cx="245" cy="108" r="10" className="signalr-screen-avatar" />
        <text x="214" y="157" textAnchor="middle" className="signalr-client-meta">JavaScript / Angular.js</text>

        <rect x="32" y="186" width="370" height="136" rx="16" className="signalr-client-zone" />
        <text x="58" y="210" className="signalr-client-title">Client-2 WebApp SPA</text>
        <rect x="165" y="218" width="98" height="84" rx="6" className="signalr-screen" />
        <rect x="170" y="224" width="88" height="14" className="signalr-screen-bar" />
        <rect x="170" y="244" width="52" height="50" className="signalr-screen-pane" />
        <circle cx="245" cy="266" r="10" className="signalr-screen-avatar" />
        <text x="214" y="315" textAnchor="middle" className="signalr-client-meta">JavaScript / Angular.js</text>

        <rect x="585" y="118" width="300" height="114" rx="16" className="signalr-hub-zone" />
        <text x="610" y="142" className="signalr-hub-title">SignalR service hub</text>
        <text x="596" y="199" className="signalr-message-label">Message</text>
        <text x="596" y="215" className="signalr-message-label">to communicate</text>

        <rect x="597" y="165" width="23" height="17" className="signalr-envelope" rx="1.5" />
        <path d="M597 165 l12 6 l12 -6" className="signalr-envelope-line" />

        <polygon points="716,160 732,169 732,191 716,200 700,191 700,169" className="signalr-service-hex" />
        <text x="746" y="183" className="signalr-service-text">Service</text>

        <line x1="585" y1="158" x2="402" y2="96" className="signalr-link" markerEnd="url(#signalr-arrow)" />
        <line x1="585" y1="188" x2="402" y2="252" className="signalr-link" markerEnd="url(#signalr-arrow)" />

        <rect x="530" y="135" width="23" height="17" className="signalr-envelope" rx="1.4" />
        <path d="M530 135 l12 5 l12 -5" className="signalr-envelope-line" />

        <rect x="530" y="193" width="23" height="17" className="signalr-envelope" rx="1.4" />
        <path d="M530 193 l12 5 l12 -5" className="signalr-envelope-line" />
      </svg>
    </div>
  )
}

function MessageBasedCommandDiagram() {
  return (
    <div className="message-command-wrap" role="img" aria-label="Message based communication for asynchronous commands">
      <svg viewBox="0 0 980 420" className="message-command-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="msg-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#474747" />
          </marker>

          <symbol id="msg-container-icon" viewBox="0 0 56 44">
            <rect x="1.5" y="1.5" width="53" height="30" rx="2" fill="#0f67c2" />
            <rect x="1.5" y="1.5" width="53" height="30" rx="2" fill="none" stroke="#8256ca" strokeWidth="2.4" />
            <polygon points="22,6 34,6 40,16 34,26 22,26 16,16" fill="none" stroke="#8ad2ff" strokeWidth="1.8" />
          </symbol>

          <symbol id="msg-data-icon" viewBox="0 0 72 52">
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="#1b80d6" />
            <rect x="9" y="10" width="30" height="24" fill="#1b80d6" />
            <ellipse cx="24" cy="34" rx="15" ry="6" fill="#1b80d6" />
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="none" stroke="#c9e7ff" strokeWidth="1.4" />
          </symbol>

          <symbol id="msg-redis-icon" viewBox="0 0 72 52">
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="#1b80d6" />
            <rect x="9" y="10" width="30" height="24" fill="#1b80d6" />
            <ellipse cx="24" cy="34" rx="15" ry="6" fill="#1b80d6" />
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="none" stroke="#c9e7ff" strokeWidth="1.4" />
            <path d="M49 19 L59 19 L54 28 L62 28 L50 42 L54 32 L46 32 Z" fill="#ffffff" />
          </symbol>
        </defs>

        <rect x="18" y="18" width="944" height="334" rx="8" className="msg-backend-zone" />
        <text x="46" y="56" className="msg-backend-title">Back end</text>

        <rect x="90" y="96" width="300" height="220" rx="24" className="msg-service-zone" />
        <text x="240" y="127" textAnchor="middle" className="msg-service-title">Basket Microservice</text>
        <text x="230" y="150" textAnchor="middle" className="msg-service-sub">Web API</text>
        <use href="#msg-container-icon" x="190" y="158" width="80" height="64" />
        <line x1="62" y1="183" x2="190" y2="183" className="msg-link" markerEnd="url(#msg-arrow)" />
        <text x="136" y="157" className="msg-anno">(1)</text>
        <text x="96" y="171" className="msg-anno">ContentForOrder</text>
        <text x="96" y="196" className="msg-anno">command</text>

        <line x1="230" y1="206" x2="230" y2="250" className="msg-link" markerEnd="url(#msg-arrow)" />
        <text x="206" y="226" className="msg-anno">(2)</text>
        <text x="236" y="226" className="msg-anno-strong">Get basket data</text>
        <use href="#msg-redis-icon" x="207" y="252" width="66" height="52" />
        <text x="256" y="279" className="msg-db-label">Cache</text>

        <rect x="590" y="96" width="300" height="220" rx="24" className="msg-service-zone" />
        <text x="740" y="127" textAnchor="middle" className="msg-service-title">Ordering Microservice</text>
        <text x="740" y="150" textAnchor="middle" className="msg-service-sub">Service</text>
        <use href="#msg-container-icon" x="700" y="158" width="80" height="64" className="msg-container-green" />
        <line x1="740" y1="206" x2="740" y2="250" className="msg-link" markerEnd="url(#msg-arrow)" />
        <use href="#msg-data-icon" x="718" y="252" width="66" height="52" className="msg-db-green" />
        <text x="768" y="279" className="msg-db-label">Database</text>

        <line x1="270" y1="183" x2="700" y2="183" className="msg-link" markerEnd="url(#msg-arrow)" />
        <text x="490" y="147" textAnchor="middle" className="msg-anno">(3)</text>
        <text x="490" y="161" textAnchor="middle" className="msg-anno">CreateOrder</text>
        <text x="490" y="174" textAnchor="middle" className="msg-anno">command</text>

        <rect x="478" y="190" width="23" height="17" className="msg-envelope" rx="1.4" />
        <path d="M478 190 l12 6 l12 -6" className="msg-envelope-line" />
        <text x="490" y="220" textAnchor="middle" className="msg-async-label">Async. Message</text>

        <text x="490" y="386" textAnchor="middle" className="msg-caption">
          Message based communication for certain asynchronous commands
        </text>
      </svg>
    </div>
  )
}

function EventDrivenConsistencyDiagram() {
  return (
    <div className="event-consistency-wrap" role="img" aria-label="Event-driven eventual consistency across microservices">
      <svg viewBox="0 0 980 390" className="event-consistency-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="evt-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#4b4b4b" />
          </marker>

          <symbol id="evt-container-icon" viewBox="0 0 56 44">
            <rect x="1.5" y="1.5" width="53" height="30" rx="2" fill="#0f67c2" />
            <rect x="1.5" y="1.5" width="53" height="30" rx="2" fill="none" stroke="#8256ca" strokeWidth="2.4" />
            <polygon points="22,6 34,6 40,16 34,26 22,26 16,16" fill="none" stroke="#8ad2ff" strokeWidth="1.8" />
          </symbol>

          <symbol id="evt-data-icon" viewBox="0 0 72 52">
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="#1b80d6" />
            <rect x="9" y="10" width="30" height="24" fill="#1b80d6" />
            <ellipse cx="24" cy="34" rx="15" ry="6" fill="#1b80d6" />
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="none" stroke="#c9e7ff" strokeWidth="1.4" />
          </symbol>

          <symbol id="evt-redis-icon" viewBox="0 0 72 52">
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="#1b80d6" />
            <rect x="9" y="10" width="30" height="24" fill="#1b80d6" />
            <ellipse cx="24" cy="34" rx="15" ry="6" fill="#1b80d6" />
            <ellipse cx="24" cy="10" rx="15" ry="6" fill="none" stroke="#c9e7ff" strokeWidth="1.4" />
            <path d="M49 19 L59 19 L54 28 L62 28 L50 42 L54 32 L46 32 Z" fill="#ffffff" />
          </symbol>
        </defs>

        <rect x="18" y="18" width="944" height="334" rx="8" className="evt-backend-zone" />
        <text x="46" y="56" className="evt-backend-title">Back end</text>

        <rect x="62" y="116" width="290" height="180" rx="24" className="evt-service-zone" />
        <text x="84" y="136" className="evt-service-title">User-Profile Microservice</text>
        <text x="208" y="160" textAnchor="middle" className="evt-service-sub">Web API Service</text>
        <use href="#evt-container-icon" x="170" y="164" width="76" height="58" className="evt-container-red" />

        <circle cx="113" cy="158" r="10" className="evt-step-badge" />
        <text x="113" y="162" textAnchor="middle" className="evt-step-number">1</text>
        <line x1="45" y1="186" x2="170" y2="186" className="evt-link" markerEnd="url(#evt-arrow)" />
        <text x="94" y="180" className="evt-anno">UpdateUser</text>
        <text x="94" y="199" className="evt-anno">command</text>

        <circle cx="185" cy="224" r="10" className="evt-step-badge" />
        <text x="185" y="228" textAnchor="middle" className="evt-step-number">2</text>
        <line x1="208" y1="208" x2="208" y2="249" className="evt-link" markerEnd="url(#evt-arrow)" />
        <text x="220" y="229" className="evt-anno">DB update</text>
        <use href="#evt-data-icon" x="185" y="246" width="66" height="52" className="evt-db-red" />
        <text x="145" y="274" className="evt-db-label">Database</text>

        <circle cx="264" cy="158" r="10" className="evt-step-badge" />
        <text x="264" y="162" textAnchor="middle" className="evt-step-number">3</text>
        <rect x="286" y="166" width="22" height="16" className="evt-envelope" rx="1.4" />
        <path d="M286 166 l11 6 l11 -6" className="evt-envelope-line" />
        <text x="268" y="203" className="evt-anno">UserUpdated event</text>
        <text x="268" y="213" className="evt-anno">(Publish Action)</text>

        <rect x="362" y="170" width="252" height="36" rx="8" className="evt-bus-box" />
        <text x="490" y="182" textAnchor="middle" className="evt-bus-title">Event Bus</text>
        <text x="490" y="196" textAnchor="middle" className="evt-bus-sub">(Publish/subscribe channel)</text>
        <line x1="246" y1="188" x2="362" y2="188" className="evt-link" markerEnd="url(#evt-arrow)" />

        <circle cx="662" cy="188" r="10" className="evt-step-badge" />
        <text x="662" y="192" textAnchor="middle" className="evt-step-number">4</text>
        <line x1="646" y1="188" x2="668" y2="136" className="evt-link" markerEnd="url(#evt-arrow)" />
        <line x1="646" y1="188" x2="668" y2="262" className="evt-link" markerEnd="url(#evt-arrow)" />

        <rect x="668" y="90" width="250" height="74" rx="14" className="evt-service-zone" />
        <text x="684" y="108" className="evt-service-title">Basket microservice</text>
        <text x="684" y="119" className="evt-service-sub">Service</text>
        <use href="#evt-container-icon" x="680" y="122" width="56" height="40" />
        <line x1="736" y1="138" x2="760" y2="138" className="evt-link" markerEnd="url(#evt-arrow)" />
        <use href="#evt-redis-icon" x="760" y="119" width="58" height="42" />
        <text x="824" y="133" className="evt-db-label">Database as</text>
        <text x="824" y="147" className="evt-db-label">Cache</text>

        <rect x="688" y="176" width="22" height="16" className="evt-envelope" rx="1.3" />
        <path d="M688 176 l11 6 l11 -6" className="evt-envelope-line" />
        <text x="718" y="188" className="evt-event-route">UserUpdated event -&gt; Buyer info</text>

        <rect x="668" y="238" width="250" height="74" rx="14" className="evt-service-zone" />
        <text x="684" y="256" className="evt-service-title">Ordering Microservice</text>
        <text x="684" y="267" className="evt-service-sub">Service</text>
        <use href="#evt-container-icon" x="680" y="270" width="56" height="40" className="evt-container-green" />
        <line x1="736" y1="286" x2="760" y2="286" className="evt-link" markerEnd="url(#evt-arrow)" />
        <use href="#evt-data-icon" x="760" y="268" width="58" height="42" className="evt-db-green" />
        <text x="824" y="287" className="evt-db-label">Database</text>

        <rect x="688" y="204" width="22" height="16" className="evt-envelope" rx="1.3" />
        <path d="M688 204 l11 6 l11 -6" className="evt-envelope-line" />
        <text x="718" y="216" className="evt-event-route">UserUpdated event -&gt; Buyer info</text>

        <text x="490" y="338" textAnchor="middle" className="evt-caption">
          Eventual consistency across microservices based on event-driven async communication
        </text>
      </svg>
    </div>
  )
}

function App() {
  const [activeSection, setActiveSection] = useState(sectionMeta[0].id)
  const [activeCommDiagram, setActiveCommDiagram] = useState('sequence')
  const [activeAsyncPatternDiagram, setActiveAsyncPatternDiagram] = useState('message')
  const [activeFlowMode, setActiveFlowMode] = useState('sync')

  const { scrollY, scrollYProgress } = useScroll()

  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 30,
    mass: 0.24,
  })

  const heroY = useTransform(scrollY, [0, 600], [0, -28])
  const orbX = useTransform(scrollY, [0, 1200], [0, 70])
  const orbY = useTransform(scrollY, [0, 1200], [0, -45])

  useEffect(() => {
    const onScroll = () => {
      let current = sectionMeta[0].id

      for (const section of sectionMeta) {
        const element = document.getElementById(section.id)
        if (!element) {
          continue
        }

        const top = element.getBoundingClientRect().top
        if (top <= window.innerHeight * 0.35) {
          current = section.id
        }
      }

      setActiveSection(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page-shell">
      <motion.div className="scroll-progress" style={{ scaleX: progressScaleX }} />

      <div className="ambient-bg" aria-hidden="true">
        <motion.div className="ambient-orb orb-a" style={{ x: orbX, y: orbY }} />
      </div>

      <motion.header className="hero" id="top" style={{ y: heroY }} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="hero-bar">
          <p className="hero-kicker">Microservices Visual Chapter</p>
          <div className="hero-tags">
            <span>Bright UI</span>
            <span>Horizontal Diagrams</span>
            <span>Animated Arrows</span>
          </div>
        </div>

        <div className="hero-grid">
          <div>
            <h1>Microservices Architecture: Visual Summary</h1>
            <p className="hero-sub">
              This website summarizes the full microservices journey: from core concepts
              and benefits, synchronous and asynchronous communication models, sequence and
              event-driven integration patterns, to ecosystem design with API Gateway,
              Docker containerization, and an ASP.NET Core in Docker deployment demo.
            </p>
            <div className="hero-actions">
              <motion.button type="button" onClick={() => scrollToSection('overview')} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                Start Overview
              </motion.button>
              <motion.button type="button" className="ghost-link" onClick={() => scrollToSection('demo')} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                Jump to Demo
              </motion.button>
            </div>
          </div>

          <motion.div className="hero-preview" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }}>
            <p className="preview-title">Web Summary Snapshot</p>
            <div className="preview-track">
              <span>Overview</span>
              <span>Communication</span>
              <span>Ecosystem</span>
              <span>Docker + Demo</span>
            </div>
            <p className="preview-sub">A complete path from architecture principles to practical implementation through visual diagrams.</p>
          </motion.div>
        </div>
      </motion.header>

      <div className="chapter-nav-wrap">
        <LayoutGroup>
          <motion.section className="section-pills" layout>
            {sectionMeta.map((section) => (
              <motion.button
                key={section.id}
                type="button"
                layout
                className={`section-pill ${activeSection === section.id ? 'is-active' : ''}`}
                onClick={() => scrollToSection(section.id)}
                whileTap={{ scale: 0.98 }}
              >
                {activeSection === section.id ? <motion.span className="pill-bg" layoutId="active-pill" /> : null}
                <span className="pill-label">{section.label}</span>
              </motion.button>
            ))}
          </motion.section>
        </LayoutGroup>
      </div>

      <div className="layout">
        <main className="content content-full">
          <motion.section id="overview" className="section-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <div className="section-head">
              <p>Section 1</p>
              <h2>Overview of Microservices</h2>
            </div>

            <motion.div
              className="overview-intro-panel"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45 }}
            >
              <article className="overview-intro-card is-definition">
                <div className="overview-intro-head">
                  <span className="overview-intro-badge">Definition</span>
                  <span className="overview-intro-mini">Microservices 101</span>
                </div>
                <h4 className="overview-intro-title">Build one large system from many focused services</h4>
                <p className="overview-intro-text">
                  Microservices is a software architectural style where a large
                  application is built from a collection of smaller services.
                </p>
                <div className="overview-intro-signal" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </article>

              <div className="overview-benefits-shell">
                <article className="overview-intro-card is-benefits">
                  <div className="overview-intro-head">
                    <span className="overview-intro-badge">Core benefits</span>
                    <span className="overview-intro-mini">Why this works</span>
                  </div>
                  <p className="overview-intro-text">
                    It enables the rapid, frequent, and reliable development and
                    deployment of large, complex applications. This architecture also
                    allows an organization to easily upgrade or evolve its technology stack.
                  </p>
                </article>

                <ul className="overview-intro-points">
                  <li>Rapid and reliable delivery at large scale</li>
                  <li>Evolve technology stack without full rewrites</li>
                </ul>
              </div>
            </motion.div>

            <div className="overview-layout">
              <div className="overview-right">
                <h3>Core Benefits</h3>
                <motion.div
                  className="benefit-matrix"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45 }}
                >
                  {benefitItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      className="benefit-row"
                      initial={{ opacity: 0, x: -18 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ delay: index * 0.06, type: 'spring', stiffness: 180, damping: 22 }}
                    >
                      <motion.article
                        className="benefit-node"
                        whileHover={{ x: 3, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      >
                        <span className="benefit-hex" style={{ '--hex-color': item.color }}>
                          <BenefitHexIcon type={item.icon} />
                        </span>
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.subtitle}</p>
                        </div>
                      </motion.article>

                      <motion.article
                        className="benefit-definition"
                        whileHover={{ y: -2 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                      >
                        <p>{item.definition}</p>
                      </motion.article>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.section>

          <motion.section id="communication" className="section-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <div className="section-head">
              <p>Section 2</p>
              <h2>Communication in Microservices</h2>
            </div>

            <div className="concept-compare">
              <motion.article
                className="concept-card sync"
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.45 }}
              >
                <div className="concept-card-head">
                  <span className="concept-icon" aria-hidden="true">S</span>
                  <div>
                    <h4>Synchronous Communication</h4>
                    <p className="concept-pill">Blocking request path</p>
                  </div>
                </div>

                <p className="concept-description">
                  The system sending the request (client) must wait until it receives
                  a response from the destination service before it can continue its work.
                </p>

                <div className="concept-protocol-box">
                  <span>Common protocols</span>
                  <p>HTTP/HTTPS (typically used with REST architecture).</p>
                </div>
              </motion.article>

              <motion.div
                className="concept-vs"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.35, delay: 0.06 }}
              >
                <span>VS</span>
              </motion.div>

              <motion.article
                className="concept-card async"
                initial={{ opacity: 0, x: 14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.45 }}
              >
                <div className="concept-card-head">
                  <span className="concept-icon" aria-hidden="true">A</span>
                  <div>
                    <h4>Asynchronous Communication</h4>
                    <p className="concept-pill">Non-blocking flow</p>
                  </div>
                </div>

                <p className="concept-description">
                  The system sending the request does not wait for an immediate
                  response. It simply sends the message and continues processing
                  other tasks without being blocked (non-blocking).
                </p>

                <div className="concept-protocol-box">
                  <span>Common protocols</span>
                  <p>
                    AMQP. Messages are usually sent to a message broker,
                    such as a RabbitMQ queue.
                  </p>
                </div>
              </motion.article>
            </div>

            <h3>Sync vs Async Flow </h3>
            <div className="comm-diagram-switcher">
              <div className="comm-switch-tabs" role="tablist" aria-label="Sync and async flow selector">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFlowMode === 'sync'}
                  className={`comm-switch-tab ${activeFlowMode === 'sync' ? 'is-active' : ''}`}
                  onClick={() => setActiveFlowMode('sync')}
                >
                  <span className="comm-switch-dot" aria-hidden="true" />
                  Synchronous
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFlowMode === 'async'}
                  className={`comm-switch-tab ${activeFlowMode === 'async' ? 'is-active' : ''}`}
                  onClick={() => setActiveFlowMode('async')}
                >
                  <span className="comm-switch-dot" aria-hidden="true" />
                  Asynchronous
                </button>
              </div>

              <motion.div
                key={activeFlowMode}
                className="diagram-stack"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                {activeFlowMode === 'sync' ? (
                  <CommunicationFlowLane
                    title="Synchronous"
                    description="Same http request/response cycle"
                    variant="sync"
                  />
                ) : (
                  <>
                    <CommunicationFlowLane
                      title="Event Bus"
                      description="Async internal events (AMQP style, no central bus block)"
                      variant="event-bus"
                    />

                    <CommunicationFlowLane
                      title="Polling"
                      description="Async polling via http"
                      variant="polling"
                    />
                  </>
                )}
              </motion.div>
            </div>

            <h3>Asynchronous microservice integration</h3>
            <div className="comm-diagram-switcher">
              <motion.article
                className="async-integration-note"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.38 }}
              >
                <ul>
                  <li>
                    <strong>Avoid synchronous chains (Anti-pattern):</strong>
                    {' '}
                    Making sequential, blocking calls between microservices is a bad design.
                  </li>
                  <li>
                    <strong>Immediate response:</strong>
                    {' '}
                    Asynchronous communication using messages or queues allows the system to respond to the client right away without waiting for all tasks to finish.
                  </li>
                  <li>
                    <strong>Core principle:</strong>
                    {' '}
                    If a service needs to trigger an action in another service, use asynchronous mechanisms (messages, events) instead of forcing it to run synchronously as part of the original request.
                  </li>
                </ul>
              </motion.article>

              <div className="comm-switch-tabs" role="tablist" aria-label="Communication diagram selector">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCommDiagram === 'sequence'}
                  className={`comm-switch-tab ${activeCommDiagram === 'sequence' ? 'is-active' : ''}`}
                  onClick={() => setActiveCommDiagram('sequence')}
                >
                  <span className="comm-switch-dot" aria-hidden="true" />
                  Sequence Communication
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCommDiagram === 'signalr'}
                  className={`comm-switch-tab ${activeCommDiagram === 'signalr' ? 'is-active' : ''}`}
                  onClick={() => setActiveCommDiagram('signalr')}
                >
                  <span className="comm-switch-dot" aria-hidden="true" />
                  SignalR Hub Communication
                </button>
              </div>

              <motion.div
                key={activeCommDiagram}
                className="diagram-wrap sequence-card focus-panel comm-switch-stage"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
                whileHover={{ y: -3 }}
              >
                {activeCommDiagram === 'sequence' ? <SequenceArchitectureDiagram /> : <SignalRCommunicationDiagram />}
              </motion.div>
            </div>

            <h3>Asynchronous message-based communication</h3>
            <div className="comm-diagram-switcher">
              <motion.article
                className="async-pattern-note"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.38 }}
              >
                <ul>
                  <li>
                    <strong>Publish/Subscribe mechanism:</strong>
                    {' '}
                    Uses an event bus to send asynchronous messages from a sender to multiple subscribers or external applications.
                  </li>
                  <li>
                    <strong>Following the Open/Closed principle:</strong>
                    {' '}
                    Allows the system to flexibly add new subscribers in the future without the need to modify the sender service.
                  </li>
                </ul>
              </motion.article>

              <div className="comm-switch-tabs" role="tablist" aria-label="Async pattern diagram selector">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeAsyncPatternDiagram === 'message'}
                  className={`comm-switch-tab ${activeAsyncPatternDiagram === 'message' ? 'is-active' : ''}`}
                  onClick={() => setActiveAsyncPatternDiagram('message')}
                >
                  <span className="comm-switch-dot" aria-hidden="true" />
                  Message-Based Command
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeAsyncPatternDiagram === 'event'}
                  className={`comm-switch-tab ${activeAsyncPatternDiagram === 'event' ? 'is-active' : ''}`}
                  onClick={() => setActiveAsyncPatternDiagram('event')}
                >
                  <span className="comm-switch-dot" aria-hidden="true" />
                  Event-Driven Consistency
                </button>
              </div>

              <motion.div
                key={activeAsyncPatternDiagram}
                className="diagram-wrap sequence-card focus-panel comm-switch-stage"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
                whileHover={{ y: -3 }}
              >
                {activeAsyncPatternDiagram === 'message' ? <MessageBasedCommandDiagram /> : <EventDrivenConsistencyDiagram />}
              </motion.div>
            </div>
          </motion.section>

          <motion.section id="ecosystem" className="section-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <div className="section-head">
              <p>Section 3</p>
              <h2>Microservices Ecosystem and ASP.NET Core</h2>
            </div>

            <div className="practice-grid">
              {ecosystemPractices.map((item) => (
                <article key={item.id} className="practice-card">
                  <span className="practice-id">{item.id}</span>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <div className="section-split ecosystem-diagram-layout">
              <div>
                <h3>Gateway Routing</h3>
                <motion.div className="diagram-wrap focus-panel gateway-diagram-wrap" whileHover={{ y: -3 }}>
                  <GatewayRoutingDiagram />
                </motion.div>
              </div>
            </div>
          </motion.section>

          <motion.section id="docker" className="section-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <div className="section-head">
              <p>Section 4</p>
              <h2>Docker and Containers</h2>
            </div>

            <div className="flow-tabs">
              <span className="is-active">Container Build and Run</span>
              <span>Deploy Through Gateway</span>
              <span>Scale Replicas</span>
            </div>

            <div className="flow-panel">
              <h4>Docker Essentials</h4>
              <p>
                <strong>Definition:</strong>
                {' '}
                Docker is both an open-source project and a company that automates application deployment using portable, self-sufficient containers.
              </p>
              <p>
                <strong>Run Anywhere:</strong>
                {' '}
                Docker containers are highly flexible. They can run natively on Linux and Windows, and can be deployed across any environment, including on-premises datacenters, external service providers, or cloud platforms like Azure.
              </p>
            </div>

            <div className="section-split docker-diagram-layout">
              <div>
                <h3>VM vs Containers</h3>
                <motion.div className="diagram-wrap focus-panel" whileHover={{ y: -3 }}>
                  <div className="docker-comparison-diagram">
                    <div className="left-panel">
                      <h4>Virtual Machines</h4>
                      <div className="vms-container">
                        <div className="vm-circle">
                          <div className="vm-label">VM1<br/>Guest OS:<br/>Windows</div>
                        </div>
                        <div className="vm-circle">
                          <div className="vm-label">VM2<br/>Guest OS:<br/>Linux</div>
                        </div>
                        <div className="vm-circle">
                          <div className="vm-label">VM3<br/>Guest OS:<br/>Unix</div>
                        </div>
                      </div>
                      <div className="box-item hypervisor">Hypervisor</div>
                      <div className="box-item infrastructure-left">Infrastructure<br/>Host Server(s)</div>
                    </div>

                    <div className="middle-panel">
                      <div className="diff-text">VS</div>
                    </div>

                    <div className="right-panel">
                      <h4>Containers</h4>
                      <div className="containers-grid">
                        <div className="container-box">Container</div>
                        <div className="container-box">Container</div>
                        <div className="container-box">Container</div>
                        <div className="container-box">Container</div>
                        <div className="container-box">Container</div>
                      </div>
                      <div className="box-item infrastructure-right">Container Software (i.e. Docker)</div>
                      <div className="box-item container-software">Operating System</div>
                      <div className="box-item container-software">Infrastructure Host Server(s)</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          <motion.section id="demo" className="section-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <div className="section-head">
              <p>Section 5</p>
              <h2>Demo: ASP.NET Core in Docker</h2>
            </div>
            <p>Use these commands to build and run a sample microservice.</p>

            <div className="code-grid">
              <div>
                <h3>Terminal Commands</h3>
                <pre>
                  <code>{`dotnet new webapi -o MyMicroservice --no-https -f net8.0
cd MyMicroservice
dotnet run
docker build -t mymicroservice .
docker run -it --rm -p 3000:80 --name mymicroservicecontainer mymicroservice`}</code>
                </pre>
              </div>

              <div>
                <h3>Dockerfile Example</h3>
                <pre>
                  <code>{`FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "MyMicroservice.dll"]`}</code>
                </pre>
              </div>
            </div>

            <div className="conclusion-card">
              <h3>Conclusion</h3>
              <div className="conclusion-tags">
                {conclusionTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p>
                Strong microservices architecture is not only about splitting services.
                It is the combination of proper boundaries, reliable communication,
                and deployment discipline.
              </p>
            </div>
          </motion.section>
        </main>
      </div>

      <footer className="page-footer">
        <p>Bright visual style, horizontal diagrams, and animated flow arrows.</p>
        <button type="button" className="back-top" onClick={() => scrollToSection('top')}>
          Back to top
        </button>
      </footer>
    </div>
  )
}

export default App

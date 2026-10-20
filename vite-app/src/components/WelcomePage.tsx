
// import {
//   ArrowRight,
//   ShieldCheck,
//   Target,
//   TrendingUp,
//   FileSearch,
//   ChartNoAxesCombined,
//   ClipboardCheck,
// } from 'lucide-react';

// type WelcomePageProps = {
//   onExplore: () => void;
// };

// export function WelcomePage({ onExplore }: WelcomePageProps) {
//   return (
//     <main
//       style={{
//         minHeight: '100vh',
//         background: 'linear-gradient(135deg, #f8fbff, #edf5ff)',
//         color: '#102c55',
//         fontFamily: 'Arial, sans-serif',
//       }}
//     >
//       <header
//         style={{
//           padding: '22px 5%',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           borderBottom: '1px solid #dce8f7',
//           background: 'rgba(255,255,255,0.85)',
//         }}
//       >
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <ShieldCheck size={34} color="#1765d1" />
//           <strong style={{ fontSize: 20 }}>
//             GST Credit-at-Risk Forecaster
//           </strong>
//         </div>
//         <span style={{ color: '#526b91' }}>
//           Smarter Insights. Safer ITC.
//         </span>
//       </header>

//       <section
//         style={{
//           maxWidth: 1300,
//           margin: '0 auto',
//           padding: '70px 5%',
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
//           gap: 50,
//           alignItems: 'center',
//         }}
//       >
//         <div>
//           <span
//             style={{
//               background: '#dcecff',
//               color: '#145ac0',
//               borderRadius: 20,
//               padding: '9px 16px',
//               fontWeight: 700,
//               fontSize: 13,
//               letterSpacing: 1,
//             }}
//           >
//             WELCOME TO
//           </span>

//           <h1
//             style={{
//               fontSize: 'clamp(38px, 5vw, 62px)',
//               lineHeight: 1.12,
//               letterSpacing: -2,
//               margin: '28px 0 22px',
//             }}
//           >
//             GST Credit-at-Risk Forecaster
//           </h1>

//           <p
//             style={{
//               fontSize: 18,
//               lineHeight: 1.8,
//               color: '#526b91',
//             }}
//           >
//             A data-driven platform designed to help businesses identify
//             GST Input Tax Credit (ITC) risks, prioritise invoice
//             discrepancies, and explore potential credit exposure.
//           </p>

//           <div
//             style={{
//               display: 'flex',
//               flexWrap: 'wrap',
//               gap: 22,
//               margin: '32px 0',
//             }}
//           >
//             <div style={{ flex: '1 1 110px' }}>
//               <ShieldCheck color="#1765d1" size={30} />
//               <h3>Detect</h3>
//               <p style={{ color: '#526b91', lineHeight: 1.5 }}>
//                 Missing invoices and mismatches
//               </p>
//             </div>

//             <div style={{ flex: '1 1 110px' }}>
//               <Target color="#0d9b77" size={30} />
//               <h3>Prioritise</h3>
//               <p style={{ color: '#526b91', lineHeight: 1.5 }}>
//                 High-risk invoices and vendors
//               </p>
//             </div>

//             <div style={{ flex: '1 1 110px' }}>
//               <TrendingUp color="#6955d9" size={30} />
//               <h3>Forecast</h3>
//               <p style={{ color: '#526b91', lineHeight: 1.5 }}>
//                 Potential ITC exposure
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={onExplore}
//             style={{
//               background: '#1765d1',
//               color: '#fff',
//               border: 0,
//               borderRadius: 10,
//               padding: '17px 25px',
//               fontSize: 17,
//               fontWeight: 700,
//               cursor: 'pointer',
//               display: 'inline-flex',
//               alignItems: 'center',
//               gap: 12,
//             }}
//           >
//             Explore Dashboard <ArrowRight size={21} />
//           </button>

//           <p style={{ color: '#7188ab', marginTop: 35, fontStyle: 'italic' }}>
//             Better data. Stronger compliance.
//           </p>
//         </div>

//         <div
//           style={{
//             background: '#fff',
//             borderRadius: 24,
//             padding: 30,
//             boxShadow: '0 20px 60px rgba(40, 91, 155, 0.12)',
//             border: '1px solid #e0ebfa',
//           }}
//         >
//           <div
//             style={{
//               background: '#edf5ff',
//               padding: 20,
//               borderRadius: 16,
//               marginBottom: 25,
//             }}
//           >
//             <ChartNoAxesCombined size={42} color="#1765d1" />
//             <h2>Understand your GST data</h2>
//             <p style={{ color: '#526b91', lineHeight: 1.7 }}>
//               Bring reconciliation insights and risk indicators into
//               one place to help focus attention where it matters.
//             </p>
//           </div>

//           {[
//             {
//               icon: <FileSearch color="#1765d1" size={23} />,
//               title: 'Review GST data',
//               description: 'Explore invoices and reconciliation results',
//             },
//             {
//               icon: <ClipboardCheck color="#0d9b77" size={23} />,
//               title: 'Investigate discrepancies',
//               description: 'Review missing or mismatched records',
//             },
//             {
//               icon: <TrendingUp color="#6955d9" size={23} />,
//               title: 'Explore risk indicators',
//               description: 'Prioritise potential ITC exposure',
//             },
//           ].map((item) => (
//             <div
//               key={item.title}
//               style={{
//                 display: 'flex',
//                 gap: 15,
//                 alignItems: 'flex-start',
//                 marginTop: 24,
//               }}
//             >
//               {item.icon}
//               <div>
//                 <strong>{item.title}</strong>
//                 <p style={{ margin: '6px 0 0', color: '#526b91' }}>
//                   {item.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </main>
//   );
// }

import {
  ArrowRight,
  ShieldCheck,
  Target,
  TrendingUp,
  FileSearch,
  ChartNoAxesCombined,
  ClipboardCheck,
  IndianRupee,
} from 'lucide-react';

type WelcomePageProps = {
  onExplore: () => void;
};

const cardStyle: React.CSSProperties = {
  background: '#23172F',
  border: '1px solid #3B2A4A',
  borderRadius: 14,
  padding: 22,
};

export function WelcomePage({ onExplore }: WelcomePageProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#170D24',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <header
        style={{
          padding: '22px 5%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          borderBottom: '1px solid #3B2A4A',
          background: '#1E1230',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: '#9F6FF0',
              borderRadius: 12,
              padding: 10,
              display: 'flex',
            }}
          >
            <ShieldCheck size={27} color="#ffffff" />
          </div>
          <strong style={{ fontSize: 20 }}>
            GST Credit-at-Risk Forecaster
          </strong>
        </div>

        <span style={{ color: '#a89bc2', fontSize: 14 }}>
          Smarter Insights. Safer ITC.
        </span>
      </header>

      <section
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '64px 5%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              background: '#2C1D3A',
              border: '1px solid #5A3A8A',
              color: '#C4A9F7',
              borderRadius: 8,
              padding: '8px 13px',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1.2,
            }}
          >
            WELCOME TO YOUR GST TRIAGE SYSTEM
          </span>

          <h1
            style={{
              fontSize: 'clamp(38px, 5vw, 64px)',
              lineHeight: 1.1,
              letterSpacing: -1.8,
              margin: '26px 0 20px',
            }}
          >
            GST Credit-at-Risk{' '}
            <span style={{ color: '#B794F6' }}>Forecaster</span>
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: '#a89bc2',
              maxWidth: 620,
            }}
          >
            Go beyond invoice mismatch detection. Explore GST reconciliation,
            prioritise discrepancies, and identify potential ITC risks
            through an explainable triage workflow.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              margin: '30px 0',
            }}
          >
            <div
              style={{
                ...cardStyle,
                flex: '1 1 130px',
                padding: 17,
                borderColor: '#5A3A8A',
              }}
            >
              <ShieldCheck size={28} color="#B794F6" />
              <h3 style={{ marginBottom: 8 }}>Detect</h3>
              <p style={{ color: '#a89bc2', lineHeight: 1.6, margin: 0 }}>
                Missing invoices and mismatches
              </p>
            </div>

            <div
              style={{
                ...cardStyle,
                flex: '1 1 130px',
                padding: 17,
                borderColor: '#245448',
              }}
            >
              <Target size={28} color="#25d6a0" />
              <h3 style={{ marginBottom: 8 }}>Prioritise</h3>
              <p style={{ color: '#a89bc2', lineHeight: 1.6, margin: 0 }}>
                High-risk invoices and vendors
              </p>
            </div>

            <div
              style={{
                ...cardStyle,
                flex: '1 1 130px',
                padding: 17,
                borderColor: '#6B4A9A',
              }}
            >
              <TrendingUp size={28} color="#a69bff" />
              <h3 style={{ marginBottom: 8 }}>Forecast</h3>
              <p style={{ color: '#a89bc2', lineHeight: 1.6, margin: 0 }}>
                Potential ITC exposure
              </p>
            </div>
          </div>

          <button
            onClick={onExplore}
            style={{
              background: '#9F6FF0',
              color: '#ffffff',
              border: '1px solid #B794F6',
              borderRadius: 10,
              padding: '16px 24px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 24px rgba(159, 111, 240, 0.25)',
            }}
          >
            Explore Dashboard <ArrowRight size={20} />
          </button>

          <p
            style={{
              color: '#7a6b90',
              marginTop: 28,
              fontSize: 13,
            }}
          >
            Synthetic demo data · Decision support, not tax or legal advice
          </p>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: 26,
            boxShadow: '0 24px 70px rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 22,
            }}
          >
            <div>
              <p
                style={{
                  color: '#C4A9F7',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  margin: '0 0 8px',
                }}
              >
                PLATFORM OVERVIEW
              </p>
              <h2 style={{ margin: 0, fontSize: 23 }}>
                From data to decisions
              </h2>
            </div>
            <ChartNoAxesCombined size={35} color="#B794F6" />
          </div>

          <div
            style={{
              background: '#170D24',
              border: '1px solid #3B2A4A',
              borderRadius: 12,
              padding: 18,
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <IndianRupee size={25} color="#B794F6" />
              <div>
                <strong>GST Reconciliation</strong>
                <p style={{ color: '#a89bc2', margin: '6px 0 0', fontSize: 14 }}>
                  Purchase register vs. GSTR-2B
                </p>
              </div>
            </div>
            <div
              style={{
                marginTop: 17,
                height: 5,
                borderRadius: 5,
                background: '#3B2A4A',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '72%',
                  height: '100%',
                  background: '#B794F6',
                }}
              />
            </div>
            <p style={{ color: '#7a6b90', fontSize: 12, marginBottom: 0 }}>
              Illustrative workflow indicator — not live performance data
            </p>
          </div>

          {[
            {
              icon: <FileSearch size={23} color="#B794F6" />,
              title: 'Review discrepancies',
              description: 'Inspect missing and unmatched invoices',
              color: '#5A3A8A',
            },
            {
              icon: <ClipboardCheck size={23} color="#fbbf24" />,
              title: 'Prioritise action',
              description: 'Route cases into transparent action buckets',
              color: '#70551c',
            },
            {
              icon: <TrendingUp size={23} color="#25d6a0" />,
              title: 'Explore risk indicators',
              description: 'Assess potential ITC exposure',
              color: '#245448',
            },
          ].map((item, index) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                gap: 15,
                alignItems: 'center',
                padding: '17px 0',
                borderBottom: index < 2 ? '1px solid #3B2A4A' : 'none',
              }}
            >
              <div
                style={{
                  background: '#170D24',
                  border: `1px solid ${item.color}`,
                  borderRadius: 10,
                  padding: 11,
                  display: 'flex',
                }}
              >
                {item.icon}
              </div>
              <div>
                <strong>{item.title}</strong>
                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#a89bc2',
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: 16,
              padding: 15,
              background: '#102b29',
              border: '1px solid #245448',
              borderRadius: 10,
              color: '#67e8b5',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <ShieldCheck size={17} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Explainable triage to support informed decisions
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: '1px solid #3B2A4A',
          padding: '20px 5%',
          color: '#7a6b90',
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        GST Credit-at-Risk Forecaster · Smarter reconciliation, proactive risk awareness
      </footer>
    </main>
  );
}

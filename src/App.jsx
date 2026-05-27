import { Component } from 'react';
import { KapsulProvider, useKapsul, SidebarV1, SidebarV2, HeaderV1, KAPSUL_THEME } from './kapsul/shell.jsx';
import { AuthScreen } from './kapsul/screens-auth.jsx';
import { HubScreen, ChatScreen } from './kapsul/screens-student.jsx';
import {
  StudioScreen, PulseScreen, StoreScreen, RagScreen, PlaceholderScreen,
} from './kapsul/screens-admin.jsx';
import { AdminLibrary } from './kapsul/chat-mvp/AdminLibrary.jsx';
import { StudentLibrary } from './kapsul/chat-mvp/StudentLibrary.jsx';
import { DevTweaks } from './DevTweaks.jsx';

const TWEAK_DEFAULTS = {
  version: 'v1',
  role: 'student',
  lang: 'fr',
  screen: 'auth',
};

function parseHash() {
  const h = (location.hash || '').replace(/^#/, '');
  if (!h) return null;
  const parts = h.split('/');
  if (parts.length < 4) return null;
  return { version: parts[0], role: parts[1], screen: parts[2], lang: parts[3] };
}

export default function App() {
  const fromHash = parseHash();
  const initial = fromHash || TWEAK_DEFAULTS;

  return (
    <KapsulProvider initial={initial}>
      <AppShell />
      {import.meta.env.DEV && <DevTweaks />}
    </KapsulProvider>
  );
}

class ScreenErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 32, color: '#F87171', fontFamily: 'monospace', fontSize: 14,
        }}>
          <div>
            <p style={{ margin: '0 0 12px', fontWeight: 600 }}>Something went wrong in this screen.</p>
            <p style={{ margin: 0, opacity: 0.8 }}>{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => { this.setState({ error: null }); location.reload(); }}
              style={{
                marginTop: 16, padding: '8px 16px', borderRadius: 6, border: 'none',
                background: '#7C3AED', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppShell() {
  const { version, role, screen, t } = useKapsul();
  const k = KAPSUL_THEME[version];
  const isV2 = version === 'v2';

  if (screen === 'auth') {
    return (
      <div className="kapsul-screen" key={`${version}-auth`} style={{ width: '100%', height: '100%' }}>
        <AuthScreen />
      </div>
    );
  }

  const Sidebar = isV2 ? SidebarV2 : SidebarV1;
  const screens = {
    hub: HubScreen,
    chat: role === 'student' ? StudentLibrary : ChatScreen,
    studio: StudioScreen,
    pulse: PulseScreen,
    store: StoreScreen,
    rag: role === 'admin' ? AdminLibrary : RagScreen,
  };
  const Screen = screens[screen] || (() => <PlaceholderScreen label={screen} />);

  const headerTitleMap = {
    hub: t.kapsulHub,
    chat: 'Kapsul AI',
    studio: t.studioLabel,
    pulse: t.pulseTitle,
    store: t.storeTitle,
    rag: t.ragTitle,
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      background: k.bg, color: k.text,
      fontFamily: k.fontUI,
    }}>
      <Sidebar />
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, minHeight: 0, position: 'relative',
      }}>
        {!isV2 && screen !== 'chat' && (
          <HeaderV1 title={headerTitleMap[screen] || ''} />
        )}
        <ScreenErrorBoundary key={`${version}-${role}-${screen}`}>
          <div className="kapsul-screen"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
            <Screen />
          </div>
        </ScreenErrorBoundary>
      </main>
    </div>
  );
}

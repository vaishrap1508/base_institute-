import { NextResponse } from 'next/server';

export interface SystemAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  timestamp: number;
  severity: 'critical' | 'warning' | 'info';
  icon: 'cpu' | 'activity' | 'database' | 'lock' | 'alert' | 'book';
}

// Global variable to keep alerts in-memory during dev server life
let alertsList: SystemAlert[] = [
  {
    id: 'ALERT-001',
    type: 'LaTeX Formatting Bug',
    title: 'LaTeX Render Failure',
    description: 'KaTeX render error on Question Q-8029-X (Arithmetic Percentage). Double dollar notation ($$) contains unescaped characters.',
    time: '14m ago',
    timestamp: Date.now() - 14 * 60000,
    severity: 'critical',
    icon: 'cpu'
  },
  {
    id: 'ALERT-002',
    type: 'Wrong Answer Report',
    title: 'Streaks Anomaly Detected',
    description: 'User Marcus Wright accumulated 4,500 XP in 10 seconds. Potential solver script exploit detected.',
    time: 'Just now',
    timestamp: Date.now(),
    severity: 'critical',
    icon: 'activity'
  }
];

export async function GET() {
  const updated = alertsList.map(alert => {
    const diffMin = Math.floor((Date.now() - alert.timestamp) / 60000);
    let timeText = 'Just now';
    if (diffMin > 0) {
      timeText = `${diffMin}m ago`;
    }
    return { ...alert, time: timeText };
  });
  return NextResponse.json({ success: true, alerts: updated });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, type, severity, icon } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing title or description' }, { status: 400 });
    }

    const newAlert: SystemAlert = {
      id: `ALERT-${Math.floor(100 + Math.random() * 900)}`,
      type: type || 'System Log',
      title,
      description,
      time: 'Just now',
      timestamp: Date.now(),
      severity: severity || 'info',
      icon: icon || 'alert'
    };

    alertsList.unshift(newAlert);
    return NextResponse.json({ success: true, alert: newAlert });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID param' }, { status: 400 });
    }

    alertsList = alertsList.filter(item => item.id !== id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { useNavigate } from 'react-router-dom';
import DriverOnboarding from '../../../../core/components/DriverOnboarding';
import './OnboardingFlow.css';

/**
 * OnboardingFlow — Driver onboarding standalone page.
 *
 * Renders the multi-step DriverOnboarding wizard.
 * On completion (onComplete), navigates to /dashboard.
 */
export default function OnboardingFlow() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-flow-root">
      <DriverOnboarding onComplete={handleComplete} />
    </div>
  );
}

/**
 * This screen has been removed from the onboarding flow.
 * GPS location is now captured on the farmer profile screen (step 1).
 * This file redirects to /land to avoid broken deep links.
 */
import { Redirect } from 'expo-router';

export default function LocationRedirect() {
  return <Redirect href="/land" />;
}

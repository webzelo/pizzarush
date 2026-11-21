import { FeaturedMenu } from "@/components/featured-menu"
import { HeroBanner } from "@/components/hero-banner"
import { HowItWorks } from "@/components/how-it-works"
import { WhyChooseUs } from "@/components/why-choose-us"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <>
      <HeroBanner />
      <FeaturedMenu />
      <WhyChooseUs />
      <HowItWorks />
    </>
  )
}

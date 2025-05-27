import React from 'react'
import { PageContainer } from '@/components/ui/common/pageContainer'
import { PageHeader } from '@/components/ui/common/pageHeader'
import TreatmentPlanForm from './TreatmentPlanForm'
const TreatmentPlansPage = () => {
  return (
    <div className='gap-y-10 bg-gradient-to-br from-teal-900 via-indigo-900 to-blue-950'>
        <PageContainer>
            <PageHeader
            title='AI treatment Journey Planner'
            description="Generate an AI-powered care plan based on a real world diagnosed condition."
            />
            <div className='max-w-3xl mx-auto mt-10'>
                <TreatmentPlanForm/>
            </div>
        </PageContainer>
      
    </div>
  )
}

export default TreatmentPlansPage

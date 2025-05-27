import React from 'react'
import { PageContainer } from '@/components/ui/common/pageContainer'
import { PageHeader } from '@/components/ui/common/pageHeader'
import SecondOpinionForm from './secondOpinionForm'
const secondOpinionPage = () => {
  return (
    <div className='bg-gradient-to-br from-teal-900 via-indigo-900 to-blue-950'>
      <PageContainer>
        <PageHeader
        title="AI-Powered Second Opinion"
        description="Get a simulated second opinion by having Sonar-AI research medical literature, alternative treatments and more."
        />
        <div className='max-w-3xl mx-auto mt-10'>
            <SecondOpinionForm/>
        </div>
      </PageContainer>
    </div>
  )
}

export default  secondOpinionPage

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Heart, Shield } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Medication {
  name: string
  dosage?: string
  frequency?: string
  notes?: string
}

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [medications, setMedications] = useState<Medication[]>([])
  const [currentMed, setCurrentMed] = useState<Medication>({ name: '' })
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    emergencyContact: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          medications
        })
      })

      if (response.ok) {
        toast.success('Account created successfully!')
        
        // Sign in the user
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.ok) {
          router.push('/dashboard')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const addMedication = () => {
    if (currentMed.name.trim()) {
      setMedications([...medications, currentMed])
      setCurrentMed({ name: '' })
    }
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-fit">
            <Image 
              src="/icon-512x512.png" 
              alt="Mood Buddy App Icon" 
              width={48} 
              height={48} 
              className="h-12 w-12"
            />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Join Mood Buddy
          </CardTitle>
          <CardDescription>
            A safe space designed just for teens (13-19)
          </CardDescription>
          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full ${
                  i <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="10"
                    max="19"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Must be 10-19"
                    required
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Teen-Only Space</p>
                      <p>This app is exclusively for teenagers aged 10-19. We're here to support you.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Parent/Guardian Email (Optional)</Label>
                  <Input
                    id="emergencyContact"
                    type="email"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="For crisis situations only"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Current Medications (Optional)</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    This helps us better understand your mental health journey
                  </p>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Medication name"
                        value={currentMed.name}
                        onChange={(e) => setCurrentMed({ ...currentMed, name: e.target.value })}
                      />
                      <Input
                        placeholder="Dosage (optional)"
                        value={currentMed.dosage || ''}
                        onChange={(e) => setCurrentMed({ ...currentMed, dosage: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder="How often? (e.g., Daily, Twice daily)"
                      value={currentMed.frequency || ''}
                      onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}
                    />
                    <Button type="button" onClick={addMedication} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Medication
                    </Button>
                  </div>

                  {medications.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {medications.map((med, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium">{med.name}</span>
                            {med.dosage && <span className="text-sm text-gray-500 ml-2">{med.dosage}</span>}
                            {med.frequency && <Badge variant="outline" className="ml-2 text-xs">{med.frequency}</Badge>}
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeMedication(index)}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {loading ? 'Creating Account...' : step < 3 ? 'Continue' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/layout/auth-guard'
import { Navbar } from '@/components/layout/navbar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Pill, 
  Settings, 
  LogOut, 
  Plus, 
  X, 
  Save,
  BarChart3,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    emergencyContact: ''
  })
  const [medications, setMedications] = useState<any[]>([])
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          age: data.user.age?.toString() || '',
          emergencyContact: data.user.emergencyContact || ''
        })
        setMedications(data.medications || [])
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          emergencyContact: profile.emergencyContact
        })
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const addMedication = async () => {
    if (!newMedication.name.trim()) {
      toast.error('Medication name is required')
      return
    }

    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedication)
      })

      if (response.ok) {
        const data = await response.json()
        setMedications([...medications, data.medication])
        setNewMedication({ name: '', dosage: '', frequency: '', notes: '' })
        toast.success('Medication added')
      } else {
        toast.error('Failed to add medication')
      }
    } catch (error) {
      toast.error('Failed to add medication')
    }
  }

  const removeMedication = async (medicationId: string) => {
    try {
      const response = await fetch(`/api/medications/${medicationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMedications(medications.filter((med: any) => med.id !== medicationId))
        toast.success('Medication removed')
      } else {
        toast.error('Failed to remove medication')
      }
    } catch (error) {
      toast.error('Failed to remove medication')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      // Manually redirect after signout
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect if signOut fails
      router.push('/auth/signin')
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <MobileHeader />
        
        <div className="container mx-auto px-3 py-4 sm:py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <User className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                Profile Settings
              </h1>
            </div>
            <p className="text-gray-600">
              Manage your personal information and medications
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="medications" className="flex items-center space-x-2">
                <Pill className="h-4 w-4" />
                <span>Medications</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your profile details and emergency contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profile.age}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">Age cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Parent/Guardian Email (Optional)</Label>
                      <Input
                        id="emergencyContact"
                        type="email"
                        value={profile.emergencyContact}
                        onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                        placeholder="For crisis situations only"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>

                  <div className="mt-8 pt-8 border-t space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-800">About Mood Buddy</h3>
                        <p className="text-sm text-blue-600">Learn about the team and technology</p>
                      </div>
                      <Button onClick={() => router.push('/about')} variant="outline">
                        <Info className="h-4 w-4 mr-2" />
                        About
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-red-800">Sign Out</h3>
                        <p className="text-sm text-red-600">End your current session</p>
                      </div>
                      <Button onClick={handleSignOut} variant="destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications">
              <div className="space-y-6">
                {/* Add Medication */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Medication</CardTitle>
                    <CardDescription>
                      Track your current medications to help monitor your mental health
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Medication name"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                      />
                      <Input
                        placeholder="Dosage (e.g., 50mg)"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Frequency (e.g., Daily)"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                      />
                      <Button onClick={addMedication} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Notes (optional)"
                      value={newMedication.notes}
                      onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                    />
                  </CardContent>
                </Card>

                {/* Current Medications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                    <CardDescription>
                      {medications.length === 0 
                        ? 'No medications added yet'
                        : `You have ${medications.length} medication${medications.length !== 1 ? 's' : ''} listed`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {medications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No medications added yet</p>
                        <p className="text-sm">Add your medications above to start tracking</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {medications.map((med: any) => (
                          <div key={med.id} className="flex items-start justify-between bg-gray-50 p-4 rounded-lg">
                            <div>
                              <h4 className="font-semibold">{med.name}</h4>
                              <div className="flex items-center space-x-3 mt-1">
                                {med.dosage && (
                                  <Badge variant="outline" className="text-xs">{med.dosage}</Badge>
                                )}
                                {med.frequency && (
                                  <Badge variant="outline" className="text-xs">{med.frequency}</Badge>
                                )}
                              </div>
                              {med.notes && (
                                <p className="text-sm text-gray-600 mt-2">{med.notes}</p>
                              )}
                            </div>
                            <Button
                              onClick={() => removeMedication(med.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                  <CardDescription>
                    Your mental health journey at a glance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Progress Tracking Coming Soon</h3>
                    <p className="text-gray-600 mb-4">
                      Comprehensive progress visualization and insights are being developed.
                    </p>
                    <Button onClick={() => router.push('/dashboard')} variant="outline">
                      View Current Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}

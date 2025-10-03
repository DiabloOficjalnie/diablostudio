import { NextRequest, NextResponse } from 'next/server'
import { dbApiHelper } from '@/lib/database-manager'
import {
  AffiliateProgram,
  AffiliateInvitation,
  AffiliateInvitationInsert,
  AffiliateInvitationFormData
} from '@/lib/database-types'

// GET - Pobierz program afiliacyjny klienta
export async function GET(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user

    // Pobierz program afiliacyjny klienta
    const affiliateResult = await dbHelper.helpers.selectWithPagination<AffiliateProgram>(
      'affiliate_program',
      [{ column: 'client_id', operator: 'eq', value: user.id }],
      { column: 'created_at', ascending: false }
    )

    if (!affiliateResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch affiliate program' },
        { status: 500 }
      )
    }

    const affiliateProgram = affiliateResult.data?.data?.[0] || null

    // Pobierz zaproszenia afiliacyjne
    let invitations: AffiliateInvitation[] = []
    if (affiliateProgram) {
      const invitationsResult = await dbHelper.helpers.selectWithPagination<AffiliateInvitation>(
        'affiliate_invitations',
        [{ column: 'affiliate_program_id', operator: 'eq', value: affiliateProgram.id }],
        { column: 'created_at', ascending: false }
      )

      if (invitationsResult.success) {
        invitations = invitationsResult.data?.data || []
      }
    }

    return NextResponse.json({
      success: true,
      affiliate_program: affiliateProgram,
      invitations: invitations,
      total_invited: invitations.length,
      pending_invitations: invitations.filter(inv => inv.status === 'pending').length,
      completed_invitations: invitations.filter(inv => inv.status === 'completed').length
    })

  } catch (error: any) {
    console.error('Error fetching affiliate program:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Zaproś nowego użytkownika do programu afiliacyjnego
export async function POST(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const body: AffiliateInvitationFormData = await request.json()
    const { invited_email } = body

    if (!invited_email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy email jest poprawny
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(invited_email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Pobierz program afiliacyjny klienta
    const affiliateResult = await dbHelper.helpers.selectWithPagination<AffiliateProgram>(
      'affiliate_program',
      [{ column: 'client_id', operator: 'eq', value: user.id }]
    )

    if (!affiliateResult.success || !affiliateResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Affiliate program not found' },
        { status: 404 }
      )
    }

    const affiliateProgram = affiliateResult.data.data[0]

    // Sprawdź czy klient nie próbuje zaprosić samego siebie
    if (invited_email === user.email) {
      return NextResponse.json(
        { error: 'Cannot invite yourself' },
        { status: 400 }
      )
    }

    // Sprawdź czy email już został zaproszony
    const existingInvitationResult = await dbHelper.helpers.selectWithPagination<AffiliateInvitation>(
      'affiliate_invitations',
      [
        { column: 'affiliate_program_id', operator: 'eq', value: affiliateProgram.id },
        { column: 'invited_email', operator: 'eq', value: invited_email }
      ]
    )

    if (existingInvitationResult.success && existingInvitationResult.data?.data?.length) {
      const existingInvitation = existingInvitationResult.data.data[0]

      if (existingInvitation.status === 'pending') {
        return NextResponse.json(
          { error: 'This email has already been invited and invitation is still pending' },
          { status: 400 }
        )
      } else if (existingInvitation.status === 'completed') {
        return NextResponse.json(
          { error: 'This email has already completed the affiliate process' },
          { status: 400 }
        )
      }
    }

    // Generuj kod zaproszenia
    const invitationCode = `AFF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Utwórz zaproszenie
    const invitationData: AffiliateInvitationInsert = {
      affiliate_program_id: affiliateProgram.id,
      invited_email: invited_email,
      invitation_code: invitationCode,
      status: 'pending'
    }

    const insertResult = await dbHelper.helpers.insert<AffiliateInvitation>(
      'affiliate_invitations',
      invitationData
    )

    if (!insertResult.success) {
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Aktualizuj licznik zaproszeń w programie afiliacyjnym
    await dbHelper.helpers.update<AffiliateProgram>(
      'affiliate_program',
      { invited_count: affiliateProgram.invited_count + 1 },
      [{ column: 'id', operator: 'eq', value: affiliateProgram.id }]
    )

    // W rzeczywistej aplikacji tutaj wyślij email z zaproszeniem
    console.log('Invitation created:', {
      invitation_code: invitationCode,
      invited_email: invited_email,
      referrer_code: affiliateProgram.referrer_code
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      data: insertResult.data,
      invitation_code: invitationCode
    })

  } catch (error: any) {
    console.error('Error creating affiliate invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Aktualizuj status zaproszenia (gdy ktoś zaakceptuje zaproszenie)
export async function PUT(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const body = await request.json()
    const { invitation_code, action } = body

    if (!invitation_code || !action) {
      return NextResponse.json(
        { error: 'Invitation code and action are required' },
        { status: 400 }
      )
    }

    // Znajdź zaproszenie po kodzie
    const invitationResult = await dbHelper.helpers.selectWithPagination<AffiliateInvitation>(
      'affiliate_invitations',
      [{ column: 'invitation_code', operator: 'eq', value: invitation_code }]
    )

    if (!invitationResult.success || !invitationResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 404 }
      )
    }

    const invitation = invitationResult.data.data[0]

    // Sprawdź czy zaproszenie nie wygasło
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    let newStatus: 'pending' | 'accepted' | 'completed' | 'expired' = 'pending'

    switch (action) {
      case 'accept':
        newStatus = 'accepted'
        break
      case 'complete':
        newStatus = 'completed'
        // Aktualizuj rabat w programie afiliacyjnym
        await dbHelper.helpers.update<AffiliateProgram>(
          'affiliate_program',
          { total_discount: Math.min(affiliateProgram.total_discount + 1, 10) },
          [{ column: 'id', operator: 'eq', value: invitation.affiliate_program_id }]
        )
        break
      case 'expire':
        newStatus = 'expired'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Aktualizuj status zaproszenia
    const updateResult = await dbHelper.helpers.update<AffiliateInvitation>(
      'affiliate_invitations',
      { status: newStatus },
      [{ column: 'id', operator: 'eq', value: invitation.id }]
    )

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Invitation ${newStatus} successfully`,
      data: updateResult.data?.[0]
    })

  } catch (error: any) {
    console.error('Error updating affiliate invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Usuń zaproszenie
export async function DELETE(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const url = new URL(request.url)
    const invitationId = url.searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy zaproszenie należy do użytkownika (przez program afiliacyjny)
    const invitationResult = await dbHelper.helpers.selectWithPagination<AffiliateInvitation>(
      'affiliate_invitations',
      [
        { column: 'id', operator: 'eq', value: invitationId },
        {
          column: 'affiliate_program_id',
          operator: 'in',
          value: `(SELECT id FROM affiliate_program WHERE client_id = '${user.id}')`
        }
      ]
    )

    if (!invitationResult.success || !invitationResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Invitation not found or access denied' },
        { status: 404 }
      )
    }

    // Usuń zaproszenie
    const deleteResult = await dbHelper.helpers.delete(
      'affiliate_invitations',
      [{ column: 'id', operator: 'eq', value: invitationId }]
    )

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: 'Failed to delete invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting affiliate invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
